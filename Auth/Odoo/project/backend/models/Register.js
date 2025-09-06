const mongoose = require('mongoose');

const RegisterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.provider;
    }
  },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  otpHash: { type: String },
  otpExpires: { type: Date },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Register', RegisterSchema);
