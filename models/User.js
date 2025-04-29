const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: String,
  email: String,
  virtualBalance: Number,
  createdAt: Date,
});

module.exports = mongoose.model('User', userSchema);
