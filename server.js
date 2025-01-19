
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'bqogccygoqnrtgpq1rg2-mysql.services.clever-cloud.com',
    user: 'urxzeji5hsnosjdj',
    password: 'umCMshWan66gjTAcViHy',
    database: 'bqogccygoqnrtgpq1rg2'
});


app.post('/auth/login', async (req, res) => {
  const { email, name, picture, sub } = req.body;

  db.query(
    'SELECT * FROM users WHERE auth0_id = ?',
    [sub],
    (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
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