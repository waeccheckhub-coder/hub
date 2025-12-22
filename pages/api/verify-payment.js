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

    // 3. Mark as Sold (Ensure you ran the ALTER TABLE command for sold_to and sold_at)
    const voucherIds = vouchers.rows.map(v => v.id);
    await db.query(
      'UPDATE vouchers SET status = $1, sold_to = $2, sold_at = NOW() WHERE id = ANY($3)',
      ['sold', phone, voucherIds]
    );

    // 4. ARKESEL SMS INTEGRATION
    const voucherDetails = vouchers.rows.map(v => `S/N: ${v.serial} PIN: ${v.pin}`).join(' | ');
    const smsMessage = `CheckerCard: Your ${type} Voucher is ${voucherDetails}. Keep it safe.`;
    
    // Format phone to 233 format
    const formattedPhone = phone.startsWith('0') ? '233' + phone.substring(1) : phone;

    try {
      await axios.get(`https://sms.arkesel.com/sms/api`, {
        params: {
          action: 'send-sms',
          api_key: process.env.ARKESEL_API_KEY,
          to: formattedPhone,
          from: 'CheckerCard', // Use your Arkesel approved Sender ID
          sms: smsMessage
        }
      });
      console.log(`SMS successfully triggered via Arkesel to ${formattedPhone}`);
    } catch (smsErr) {
      console.error("Arkesel Error:", smsErr.response?.data || smsErr.message);
      // We don't block the user's success page if SMS fails, but we log it
    }

    return res.status(200).json({ vouchers: vouchers.rows });

  } catch (error) {
    console.error("Internal API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
