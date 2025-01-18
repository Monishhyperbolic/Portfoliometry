const http = require('http');
const url = require('url');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql2');

// Google OAuth Client ID
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
    parsePostData(req, async (body) => {
      const { idToken } = JSON.parse(body);
      
      if (!idToken) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'No token provided' }));
      }

      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const name = payload['name'];
        const email = payload['email'];

        db.query('SELECT * FROM users WHERE google_id = ?', [googleId], (err, results) => {
          if (err) {
            console.error('Error checking user in database', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Database error' }));
          }

          if (results.length > 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'User authenticated', user: results[0] }));
          } else {
            db.query('INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)', [googleId, name, email], (err, result) => {
              if (err) {
                console.error('Error inserting user into database', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Database error' }));
              }

              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                message: 'User authenticated and created',
                user: { id: result.insertId, google_id: googleId, name: name, email: email },
              }));
            });
          }
        });
      } catch (error) {
        console.error('Error verifying token', error);
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid token' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

// Start the server
server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port', process.env.PORT || 3000);
});
