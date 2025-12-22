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

    if (paystackRes.data.data.status !== 'success') {
      return res.status(400).json({ error: "Verification failed" });
    }

    // 2. Fetch Available Vouchers
    const vouchers = await db.query(
      'SELECT id, serial, pin FROM vouchers WHERE type = $1 AND status = $2 LIMIT $3',
      [type, 'available', quantity]
    );

    if (vouchers.rowCount < quantity) {
      return res.status(400).json({ error: "OUT_OF_STOCK" });
    }

    // 3. Mark as Sold
    const voucherIds = vouchers.rows.map(v => v.id);
    await db.query(
      'UPDATE vouchers SET status = $1, sold_to = $2, sold_at = NOW() WHERE id = ANY($3)',
      ['sold', phone, voucherIds]
    );

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
    // Formatted for better readability on mobile screens
    const voucherDetails = vouchers.rows.map(v => `S/N: ${v.serial} PIN: ${v.pin}`).join('\n');
    
    const smsMessage = `CheckerCard: Your ${type} purchase was successful.\n\n${voucherDetails}\n\nCheck Result here: ${portalLink}\n\nThank you for choosing Waec Gh Cards Online.`;
    
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
