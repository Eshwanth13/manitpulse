const mongoose = require('mongoose');

/**
 * anonymousUsers collection
 * Zero PII. The only link to a student's identity is emailHash:
 *   emailHash = HMAC-SHA256(normalizedEmail, EMAIL_HASH_SECRET)
 * This is NOT reversible without the secret key — email itself is never stored.
 *
 * Purpose: when the same email verifies again (returning student), we find this
 * document by emailHash and return the SAME anonymousToken, so their posts persist.
 */
const anonymousUserSchema = new mongoose.Schema({
  anonymousToken: {
    type: String,
    required: true,
    unique: true,
  },
  // HMAC-SHA256 of email — lets us reunite a returning student with their posts
  // without ever touching the email address after verification
  emailHash: {
    type: String,
    default: null,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Rate limiting fields
  postCountToday: {
    type: Number,
    default: 0,
  },
  lastPostTimestamp: {
    type: Date,
    default: null,
  },
  lastResetDate: {
    type: String, // 'YYYY-MM-DD'
    default: null,
  },
});

const AnonymousUser = mongoose.model('AnonymousUser', anonymousUserSchema);
module.exports = AnonymousUser;
