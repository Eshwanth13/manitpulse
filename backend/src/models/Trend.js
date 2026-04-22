const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  totalPosts: { type: Number, default: 0 },
  positiveCount: { type: Number, default: 0 },
  neutralCount: { type: Number, default: 0 },
  negativeCount: { type: Number, default: 0 },
  topCategories: [String],
  topTopics: [String],
  avgSentimentScore: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Trend = mongoose.model('Trend', trendSchema);

module.exports = Trend;
