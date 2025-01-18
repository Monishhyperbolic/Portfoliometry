const express = require('express');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');

// Initialize express app
const app = express();

// Google OAuth Client ID (replace with your actual client ID)
const CLIENT_ID = '688477909858-kqgsf59np30758lrec80epni3a7ppvd4.apps.googleusercontent.com';

// Initialize OAuth2Client for token verification
const client = new OAuth2Client(CLIENT_ID);

// MySQL connection setup
const db = mysql.createPool({
  host: 'bqogccygoqnrtgpq1rg2-mysql.services.clever-cloud.com', // e.g., for PlanetScale, something like 'aws.connect.psdb.cloud'
  user: 'urxzeji5hsnosjdj',
  password: 'umCMshWan66gjTAcViHy',
  database: 'bqogccygoqnrtgpq1rg2',
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// POST route to verify Google ID Token and store user data
app.post('/auth/google', async (req, res) => {
  const token = req.body.idToken; // Extract the ID token from the request body

  if (!token) {
    return res.status(400).send('No token provided.');
  }

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Ensure token is intended for your app
    });

    // Extract user information from the token payload
    const payload = ticket.getPayload();
    const googleId = payload['sub']; // Google User ID
    const name = payload['name']; // User's name
    const email = payload['email']; // User's email

    // Check if user already exists in the database
    db.query(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId],
      (err, results) => {
        if (err) {
          console.error('Error checking user in database', err);
          return res.status(500).send('Database error');
        }

        if (results.length > 0) {
          // User exists, return user data
          return res.status(200).send({
            message: 'User authenticated',
            user: results[0], // Return the existing user data
          });
        } else {
          // User doesn't exist, insert new user
          db.query(
            'INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)',
            [googleId, name, email],
            (err, result) => {
              if (err) {
                console.error('Error inserting user into database', err);
                return res.status(500).send('Database error');
              }

              // Return the newly created user data
              res.status(201).send({
                message: 'User authenticated and created',
                user: {
                  id: result.insertId, // User's ID from the database
                  google_id: googleId,
                  name: name,
                  email: email,
                },
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Error verifying token', error);
    res.status(401).send('Invalid token');
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
