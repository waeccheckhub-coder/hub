import db from '../../../lib/db';

export default async function handler(req, res) {
  // Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { csvData, type } = req.body;

  // Basic Validation
  if (!csvData || !type) {
    return res.status(400).json({ error: 'Missing required data: csvData or type' });
  }

  try {
    // 1. Split the data by new lines (handles both single manual entry and bulk CSV)
    const lines = csvData.trim().split(/\r?\n/);
    const results = {
      success: 0,
      failed: 0,
    };

    // 2. Start a loop to process each line
    for (const line of lines) {
      // Clean up whitespace and split by comma
      const parts = line.split(',').map(item => item.trim());
      
      // Check if we have both Serial and Pin
      if (parts.length >= 2) {
        const [serial, pin] = parts;

        try {
          // 3. Insert into the database
          // Using 'ON CONFLICT' to prevent duplicate serial numbers if you have a unique constraint
          await db.query(
            `INSERT INTO vouchers (type, serial, pin, status, created_at) 
             VALUES ($1, $2, $3, $4, NOW()) 
             ON CONFLICT (serial) DO NOTHING`, 
            [type, serial, pin, 'available']
          );
          results.success++;
        } catch (dbError) {
          console.error(`Error inserting line: ${line}`, dbError);
          results.failed++;
        }
      } else {
        results.failed++;
      }
    }

    // 4. Return summary to the dashboard
    return res.status(200).json({
      message: 'Processing complete',
      summary: results
    });

  } catch (error) {
    console.error('Upload API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error during upload' });
  }
}
