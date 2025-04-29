const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Hardcoded MongoDB URI — make sure to keep this private!
const uri = 'mongodb+srv://monish:Townchill1@tradedaddy.azllkwl.mongodb.net/?retryWrites=true&w=majority&appName=tradedaddy';
const client = new MongoClient(uri);

async function connect() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

connect();

// ✅ Get user by email
app.get('/users', async (req, res) => {
    const { email } = req.query;
    try {
        const db = client.db('tradedaddy');
        const user = await db.collection('Users').findOne({ email });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Error querying user' });
    }
});

// ✅ Create new user
app.post('/users', async (req, res) => {
    const user = req.body;
    try {
        const db = client.db('tradedaddy');
        await db.collection('Users').insertOne(user);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// ✅ Get portfolio by userId
app.get('/portfolio/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const db = client.db('tradedaddy');
        const portfolio = await db.collection('Portfolio').find({ userId }).toArray();
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ error: 'Error querying portfolio' });
    }
});

// ✅ Get transactions by userId
app.get('/transactions/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const db = client.db('tradedaddy');
        const transactions = await db.collection('Transactions').find({ userId }).sort({ timestamp: -1 }).toArray();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error querying transactions' });
    }
});

// ✅ Get leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const db = client.db('tradedaddy');
        const leaderboard = await db.collection('Leaderboard').find().sort({ portfolioValue: -1 }).limit(10).toArray();
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Error querying leaderboard' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
