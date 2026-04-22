const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  fakeScore: Number,
  fakeReason: String,
  approved: {
    type: Boolean,
    default: false,
  },
  moderatedBy: {
    type: String,
    enum: ['ai', 'admin'],
    default: 'ai',
  },
  adminNote: String,
}, {
  timestamps: true,
});

const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);

module.exports = ModerationLog;
