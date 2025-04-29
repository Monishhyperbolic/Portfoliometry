const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { userId } = req.query;

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT id, user_id, stock_symbol, type, quantity, price, timestamp FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC',
        [userId]
      );
      res.status(200).json(result.rows);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Transactions API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
};