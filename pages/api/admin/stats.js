import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from '../../../lib/db';
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Access Denied" });
  }

  // ... rest of your API logic


export default async function handler(req, res) {
  try {
    const totalRes = await db.query('SELECT COUNT(*) FROM vouchers');
    const soldRes = await db.query("SELECT COUNT(*) FROM vouchers WHERE status = 'sold'");
    const availableRes = await db.query("SELECT COUNT(*) FROM vouchers WHERE status = 'available'");
    
    const recentVouchers = await db.query(
      'SELECT type, serial, status, created_at FROM vouchers ORDER BY created_at DESC LIMIT 10'
    );

    res.status(200).json({
      stats: {
        total: parseInt(totalRes.rows[0].count),
        sold: parseInt(soldRes.rows[0].count),
        available: parseInt(availableRes.rows[0].count),
      },
      recentVouchers: recentVouchers.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
}
