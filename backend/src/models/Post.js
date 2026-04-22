const mongoose = require('mongoose');

/**
 * posts collection
 * Spec-aligned schema: anonymousToken (raw, not hashed), emotions[], fakeProbability,
 * aiReason, inputType, status: approved|rejected|deleted.
 * embedding stored as float array inside this document (no vector DB needed).
 */
const postSchema = new mongoose.Schema({
  anonymousToken: {
    type: String,
    required: true,
    select: false, // never returned in public API responses
  },
  category: {
    type: String,
    enum: ['Placements', 'Academics', 'Faculty', 'Hostel', 'Mess Food', 'Mental Health'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000,
  },
  inputType: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text',
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en',
  },
  // Status values:
  //   approved  — passed AI moderation, visible in public feed
  //   rejected  — blocked by AI, visible only to admin
  //   deleted   — soft-deleted by student, hidden from feed, visible to admin (audit)
  status: {
    type: String,
    enum: ['approved', 'rejected', 'deleted'],
    default: 'approved',
  },
  sentimentScore: {
    type: Number, // -1.0 to 1.0
    default: 0,
  },
  sentimentLabel: {
    type: String,
    enum: ['Positive', 'Negative', 'Neutral', 'Mixed'],
    default: 'Neutral',
  },
  emotions: {
    type: [String],
    default: [],
  },
  topics: {
    type: [String],
    default: [],
  },
  aiReason: {
    type: String,
    default: '',
  },
  fakeProbability: {
    type: Number,
    default: 0,
  },
  reportCount: {
    type: Number,
    default: 0,
  },
  embedding: {
    type: [Number],
    select: false, // never returned in API responses
  },
}, {
  timestamps: true,
});

// Indexes matching the spec
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1, createdAt: -1 });
postSchema.index({ anonymousToken: 1, status: 1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
