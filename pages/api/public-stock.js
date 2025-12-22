import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const results = await db.query(`
      SELECT type, COUNT(*) as count 
      FROM vouchers 
      WHERE status = 'available' 
      GROUP BY type
    `);

    // Format the data into a simple object: { WASSCE: 5, BECE: 0 ... }
    const stockMap = { WASSCE: 0, BECE: 0, PLACEMENT: 0 };
    results.rows.forEach(row => {
      stockMap[row.type] = parseInt(row.count);
    });

    res.status(200).json(stockMap);
  } catch (error) {
    res.status(500).json({ error: "Stock check failed" });
  }
}
