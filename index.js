// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection
const mongoURI = 'mongodb+srv://monish:Townchill1@tradedaddy.azllkwl.mongodb.net/?retryWrites=true&w=majority&appName=tradedaddy';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
