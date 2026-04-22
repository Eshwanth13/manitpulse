const mongoose = require('mongoose');

/**
 * verificationTokens collection
 * TTL index auto-deletes after 15 minutes (900 seconds).
 * Email is NEVER retained after successful verification — deleteOne() is called explicitly.
 */
const verificationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: auto-expire the *document* 15 minutes after creation
// (belt-and-suspenders — we also deleteOne() on successful verification)
verificationTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);
module.exports = VerificationToken;
