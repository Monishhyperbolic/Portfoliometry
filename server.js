const http = require('http');
const url = require('url');
const querystring = require('querystring');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');

// Google OAuth Client ID (replace with your actual client ID)
const CLIENT_ID = '688477909858-kqgsf59np30758lrec80epni3a7ppvd4.apps.googleusercontent.com';

// Initialize OAuth2Client for token verification
const client = new OAuth2Client(CLIENT_ID);

// MySQL connection setup (using connection pooling)
const db = mysql.createPool({
  host: 'bqogccygoqnrtgpq1rg2-mysql.services.clever-cloud.com', 
  user: 'urxzeji5hsnosjdj',
  password: 'umCMshWan66gjTAcViHy',
  database: 'bqogccygoqnrtgpq1rg2',
});

// Helper function to handle POST data
const parsePostData = (req, callback) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    callback(body);
  });
};

// HTTP server to handle incoming requests
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/auth/google') {
    // Parse the body of the POST request
    parsePostData(req, async (body) => {
      const { idToken } = JSON.parse(body); // Extract idToken from body
      
      if (!idToken) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'No token provided' }));
      }

      try {
        // Verify the token with Google
        const ticket = await client.verifyIdToken({
          idToken,
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
              res.writeHead(500, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ message: 'Database error' }));
            }

            if (results.length > 0) {
              // User exists, return user data
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({
                message: 'User authenticated',
                user: results[0], // Return the existing user data
              }));
            } else {
              // User doesn't exist, insert new user
              db.query(
                'INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)',
                [googleId, name, email],
                (err, result) => {
                  if (err) {
                    console.error('Error inserting user into database', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Database error' }));
                  }

                  // Return the newly created user data
                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    message: 'User authenticated and created',
                    user: {
                      id: result.insertId, // User's ID from the database
                      google_id: googleId,
                      name: name,
                      email: email,
                    },
                  }));
                }
              );
            }
          }
        );
      } catch (error) {
        console.error('Error verifying token', error);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid token' }));
      }
    });
  } else {
    // Handle unsupported request methods or URLs
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
