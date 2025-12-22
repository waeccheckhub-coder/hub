import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { vouchers, type, password } = req.body; // vouchers is array of {serial, pin}

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Efficient bulk insert
    for (const v of vouchers) {
      await client.query(
        `INSERT INTO vouchers (type, serial, pin) VALUES ($1, $2, $3)`,
        [type, v.serial, v.pin]
      );
    }
    
    await client.query('COMMIT');
    res.status(200).json({ message: 'Upload successful' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
