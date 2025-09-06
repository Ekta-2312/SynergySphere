const mongoose = require('mongoose');

const RegisterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.provider; } },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Register', RegisterSchema);
