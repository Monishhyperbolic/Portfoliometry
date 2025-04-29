const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POST-PortGRES_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  const { email } = req.query;
  const { method, body } = req;

  try {
    if (method === 'GET') {
      const result = await pool.query(
        'SELECT id, email, virtual_balance, created_at FROM users WHERE email = $1',
        [email]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user: result.rows[0] });
    } else if (method === 'POST') {
      const { userId, email, virtualBalance = 50000.00, createdAt } = body;
      const result = await pool.query(
        `INSERT INTO users (id, email, virtual_balance, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, virtual_balance, created_at`,
        [userId, email, virtualBalance, new Date(createdAt)]
      );
      if (result.rows.length === 0) {
        return res.status(409).json({ error: 'User already exists' });
      }
      res.status(201).json({ id: result.rows[0].id });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users API error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
};