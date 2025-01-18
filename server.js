// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
  host: 'bqogccygoqnrtgpq1rg2-mysql.services.clever-cloud.com',
  user: 'urxzeji5hsnosjdj',
  password: 'umCMshWan66gjTAcViHy',
  database: 'bqogccygoqnrtgpq1rg2'
});


const client = new OAuth2Client('688477909858-kqgsf59np30758lrec80epni3a7ppvd4.apps.googleusercontent.com');

app.post('/auth/google', async (req, res) => {
  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: '688477909858-kqgsf59np30758lrec80epni3a7ppvd4.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    db.query(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId],
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
          // New user - insert into database
          db.query(
            'INSERT INTO users (google_id, email, name, picture) VALUES (?, ?, ?, ?)',
            [googleId, email, name, picture],
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
            'UPDATE users SET email = ?, name = ?, picture = ? WHERE google_id = ?',
            [email, name, picture, googleId],
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
  } catch (error) {
    console.error('Verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});