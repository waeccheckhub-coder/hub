import db from '../../lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, quantity, type, phone } = req.body;

  try {
    // 1. Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    ).catch(e => {
      console.error("Paystack API Error:", e.response?.data);
      return null;
    });

    if (!paystackRes || paystackRes.data.data.status !== 'success') {
      return res.status(400).json({ error: "PAYSTACK_VERIFICATION_FAILED" });
    }

    // 2. Check Database Stock (MOST LIKELY CULPRIT)
    const vouchers = await db.query(
      'SELECT id, serial, pin FROM vouchers WHERE type = $1 AND status = $2 LIMIT $3',
      [type, 'available', quantity]
    );

    if (vouchers.rowCount < quantity) {
      return res.status(400).json({ 
        error: "OUT_OF_STOCK", 
        requested: type, 
        found: vouchers.rowCount 
      });
    }

    // 3. Process Transaction
    const voucherIds = vouchers.rows.map(v => v.id);
    await db.query(
      'UPDATE vouchers SET status = $1, sold_to = $2, sold_at = NOW() WHERE id = ANY($3)',
      ['sold', phone, voucherIds]
    );

    return res.status(200).json({ vouchers: vouchers.rows });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
  }
}
