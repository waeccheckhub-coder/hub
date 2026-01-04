import db from '../../lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { reference, quantity, type, phone } = req.body;

  try {
    // 1. Verify Payment with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const paystackData = paystackRes.data.data;

    if (paystackData.status !== 'success') {
      return res.status(400).json({ error: "Verification failed" });
    }

    // Capture the verified amount (Paystack returns subunits/kobo, so divide by 100)
    const verifiedAmount = paystackData.amount / 100;

    // 2. Fetch Available Vouchers
    const vouchers = await db.query(
      'SELECT id, serial, pin FROM vouchers WHERE type = $1 AND status = $2 LIMIT $3',
      [type, 'available', quantity]
    );

    if (vouchers.rowCount < quantity) {
      return res.status(400).json({ error: "OUT_OF_STOCK" });
    }

    // 3. Mark Vouchers as Sold
    const voucherIds = vouchers.rows.map(v => v.id);
    await db.query(
      'UPDATE vouchers SET status = $1, sold_to = $2, sold_at = NOW() WHERE id = ANY($3)',
      ['sold', phone, voucherIds]
    );

    // ---------------------------------------------------------
    // 3.5 (THE FIX) INSERT INTO TRANSACTIONS TABLE
    // ---------------------------------------------------------
    try {
      await db.query(
        `INSERT INTO transactions 
        (reference, phone, amount, quantity, voucher_type, status, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [reference, phone, verifiedAmount, quantity, type, 'success']
      );
    } catch (dbError) {
      // Critical Log: If this fails, you have sold vouchers but no transaction record.
      console.error("CRITICAL: Failed to save transaction record:", dbError);
      // We do NOT return error here, because the user has already paid and vouchers are assigned. 
      // We proceed to give them their vouchers.
    }
    // ---------------------------------------------------------

    // 4. PORTAL LINK MAPPING
    const getPortalLink = (vType) => {
      const t = vType?.toUpperCase() || "";
      if (t.includes('WASSCE') || t.includes('NOVDEC')) return 'https://ghana.waecdirect.org';
      if (t.includes('BECE')) return 'https://eresults.waecgh.org';
      if (t.includes('CSSPS') || t.includes('PLACEMENT')) return 'https://www.cssps.gov.gh';
      return 'https://waeccardsonline.com'; // Default fallback
    };

    const portalLink = getPortalLink(type);

    // 5. ARKESEL SMS INTEGRATION
    const voucherDetails = vouchers.rows.map(v => `S/N: ${v.serial} PIN: ${v.pin}`).join('\n');
    
    const smsMessage = `CheckerCard: Your ${type} purchase was successful.\n\n${voucherDetails}\n\nCheck Result here: ${portalLink}\n\nThank you for choosing waec gh checkers.`;
    
    // Format phone to 233 format
    const formattedPhone = phone.startsWith('0') ? '233' + phone.substring(1) : phone;

    try {
      await axios.get(`https://sms.arkesel.com/sms/api`, {
        params: {
          action: 'send-sms',
          api_key: process.env.ARKESEL_API_KEY,
          to: formattedPhone,
          from: 'CheckerCard', 
          sms: smsMessage
        }
      });
      console.log(`SMS successfully triggered via Arkesel to ${formattedPhone}`);
    } catch (smsErr) {
      console.error("Arkesel Error:", smsErr.response?.data || smsErr.message);
    }

    return res.status(200).json({ vouchers: vouchers.rows });

  } catch (error) {
    console.error("Internal API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
