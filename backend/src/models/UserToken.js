const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  anonymousToken: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

const UserToken = mongoose.model('UserToken', userTokenSchema);

module.exports = UserToken;
