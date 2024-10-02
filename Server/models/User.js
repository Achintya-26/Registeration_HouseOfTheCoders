const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
