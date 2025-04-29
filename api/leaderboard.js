const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT
            u.id AS user_id,
            (u.virtual_balance + COALESCE((
                SELECT SUM(p.quantity * p.avg_buy_price)
                FROM portfolio p
                WHERE p.user_id = u.id
            ), 0)) AS portfolio_value
        FROM users u
        ORDER BY portfolio_value DESC
        LIMIT 10
      `);
      res.status(200).json(result.rows);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Leaderboard API error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch leaderboard' });
  }
};