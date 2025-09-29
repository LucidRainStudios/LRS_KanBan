const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 1337;

// Middleware
app.use(cors());
app.use(express.json());

// Database client
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/lrs_kanban',
});

// Connect to database
dbClient
  .connect()
  .then(() => {
    console.log('Connected to database');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LRS KanBan API is running' });
});

// Health check
app.get('/db-health', async (req, res) => {
  try {
    await dbClient.query('SELECT 1 as test');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Login endpoint
app.post('/api/access-tokens', async (req, res) => {
  try {
    const { emailAddress } = req.body;

    // Find user
    const userResult = await dbClient.query('SELECT * FROM "user" WHERE email = $1', [emailAddress.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // For development, skip password check
    // TODO: Add proper password validation

    // Create access token
    const tokenResult = await dbClient.query('INSERT INTO access_token (user_id) VALUES ($1) RETURNING id', [user.id]);

    const token = tokenResult.rows[0];

    return res.json({
      item: token.id,
      included: {
        users: [
          {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            isAdmin: user.is_admin,
          },
        ],
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  dbClient.end();
  process.exit(0);
});
