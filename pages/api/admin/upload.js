import db from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { csvData, type } = req.body;

  try {
    const lines = csvData.trim().split('\n');
    for (const line of lines) {
      const [serial, pin] = line.split(',').map(item => item.trim());
      if (serial && pin) {
        await db.query(
          'INSERT INTO vouchers (type, serial, pin, status) VALUES ($1, $2, $3, $4)',
          [type, serial, pin, 'available']
        );
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
