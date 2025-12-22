import db from '../../lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, quantity, type, phone } = req.body;

  // LOGGING: Check this in your Vercel logs or Terminal
  console.log("PAYMENT VERIFY ATTEMPT:", { reference, quantity, type, phone });

  if (!reference || !type || !phone) {
    return res.status(400).json({ error: "Missing required fields in request body" });
  }

  try {
    // 1. Verify with Paystack (Server-to-Server)
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    if (paystackRes.data.data.status !== 'success') {
      return res.status(400).json({ error: "Paystack payment not verified" });
    }

    // 2. Fetch available vouchers from DB
    const vouchers = await db.query(
      'SELECT id, serial, pin FROM vouchers WHERE type = $1 AND status = $2 LIMIT $3',
      [type, 'available', quantity]
    );

    if (vouchers.rowCount < quantity) {
      return res.status(400).json({ error: "Insufficient stock for this voucher type" });
    }

    // 3. Mark as sold and link to phone
    const voucherIds = vouchers.rows.map(v => v.id);
    await db.query(
      'UPDATE vouchers SET status = $1, sold_to = $2, sold_at = NOW() WHERE id = ANY($3)',
      ['sold', phone, voucherIds]
    );

    return res.status(200).json({ vouchers: vouchers.rows });

  } catch (error) {
    console.error("VERIFY ERROR:", error.response?.data || error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
