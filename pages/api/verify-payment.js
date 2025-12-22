import db from '../../lib/db';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { reference, quantity, type, phone } = req.body;
  const client = await db.connect();

  try {
    // 1. Verify Payment with Paystack
    const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });

    if (paystackRes.data.data.status !== 'success') {
      throw new Error('Payment verification failed');
    }

    // 2. Start Database Transaction
    await client.query('BEGIN');

    // 3. Find and Lock Vouchers (Prevent double selling)
    const findVouchersQuery = `
      SELECT id, serial, pin 
      FROM vouchers 
      WHERE type = $1 AND status = 'available' 
      LIMIT $2 
      FOR UPDATE SKIP LOCKED
    `;
    const { rows: vouchers } = await client.query(findVouchersQuery, [type, quantity]);

    if (vouchers.length < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough stock available. Please contact support.' });
    }

    // 4. Update Vouchers to 'sold'
    const voucherIds = vouchers.map(v => v.id);
    await client.query(`
      UPDATE vouchers 
      SET status = 'sold', sold_to = $1, transaction_ref = $2 
      WHERE id = ANY($3::int[])
    `, [phone, reference, voucherIds]);

    // 5. Record Transaction
    await client.query(`
      INSERT INTO transactions (reference, phone, amount, quantity, voucher_type)
      VALUES ($1, $2, $3, $4, $5)
    `, [reference, phone, (paystackRes.data.data.amount / 100), quantity, type]);

    await client.query('COMMIT');

    // 6. Send SMS via Arkesel (Async - don't block response)
    const message = `Thanks for buying! Here are your ${type} checkers:\n` + 
                    vouchers.map(v => `Serial: ${v.serial}, PIN: ${v.pin}`).join('\n');
    
    axios.get('https://sms.arkesel.com/sms/api', {
      params: {
        action: 'send-sms',
        api_key: process.env.ARKESEL_API_KEY,
        to: phone,
        from: process.env.ARKESEL_SENDER_ID,
        sms: message
      }
    }).catch(err => console.error("SMS Error:", err));

    // 7. Return Vouchers to Frontend
    return res.status(200).json({ success: true, vouchers });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: 'Transaction failed' });
  } finally {
    client.release();
  }
}
