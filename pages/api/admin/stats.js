import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import db from '../../../lib/db';

export default async function handler(req, res) {
  // 1. Security Check: Verify Admin Session
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Access Denied" });
  }

  try {
    // 2. Fetch Counts
    const totalRes = await db.query('SELECT COUNT(*) FROM vouchers');
    const soldRes = await db.query("SELECT COUNT(*) FROM vouchers WHERE status = 'sold'");
    const availableRes = await db.query("SELECT COUNT(*) FROM vouchers WHERE status = 'available'");
    
    // 3. Fetch Recent Records
    const recentVouchers = await db.query(
      'SELECT type, serial, status, created_at FROM vouchers ORDER BY created_at DESC LIMIT 10'
    );

    // 4. Send Response
    return res.status(200).json({
      stats: {
        total: parseInt(totalRes.rows[0].count),
        sold: parseInt(soldRes.rows[0].count),
        available: parseInt(availableRes.rows[0].count),
      },
      recentVouchers: recentVouchers.rows
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
