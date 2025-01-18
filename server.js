
// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'bqogccygoqnrtgpq1rg2-mysql.services.clever-cloud.com',
    user: 'urxzeji5hsnosjdj',
    password: 'umCMshWan66gjTAcViHy',
    database: 'bqogccygoqnrtgpq1rg2'
});

// Create users table
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    picture VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Handle user login/registration
app.post('/auth/login', async (req, res) => {
  const { email, name, picture, sub } = req.body;

  // Check if user exists
  db.query(
    'SELECT * FROM users WHERE auth0_id = ?',
    [sub],
    (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        // New user - insert into database
        db.query(
          'INSERT INTO users (auth0_id, email, name, picture) VALUES (?, ?, ?, ?)',
          [sub, email, name, picture],
          (error, results) => {
            if (error) {
              console.error('Insert error:', error);
              return res.status(500).json({ error: 'Failed to create user' });
            }
            res.json({
              message: 'User created successfully',
              user: { email, name, picture }
            });
          }
        );
      } else {
        // Existing user - update their information
        db.query(
          'UPDATE users SET email = ?, name = ?, picture = ? WHERE auth0_id = ?',
          [email, name, picture, sub],
          (error) => {
            if (error) {
              console.error('Update error:', error);
              return res.status(500).json({ error: 'Failed to update user' });
            }
            res.json({
              message: 'User logged in successfully',
              user: { email, name, picture }
            });
          }
        );
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});