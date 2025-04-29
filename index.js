require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json()); // for parsing JSON request bodies

// MongoDB connection
const mongoURI = 'mongodb+srv://monish:Townchill1@tradedaddy.azllkwl.mongodb.net/?retryWrites=true&w=majority&appName=tradedaddy';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Create a Mongoose model
const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String
});

const Item = mongoose.model('Item', itemSchema);

// Root route
app.get('/', (req, res) => {
  res.send('✅ API is working and connected to MongoDB');
});

// GET all items
app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
