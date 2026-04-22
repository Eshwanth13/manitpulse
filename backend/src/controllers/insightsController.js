const Post = require('../models/Post');

// ─── GET /api/insights/summary ───────────────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const totalApprovedPosts = await Post.countDocuments({ status: 'approved' });

    const sentimentAgg = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
    ]);
    const averageSentimentScore = sentimentAgg[0]?.avg?.toFixed(2) || 0;

    const sentimentCounts = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$sentimentLabel', count: { $sum: 1 } } },
    ]);
    const sentimentBreakdown = {};
    sentimentCounts.forEach((s) => { sentimentBreakdown[s._id] = s.count; });

    const topCategoriesAgg = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);
    const topCategories = topCategoriesAgg.map((c) => c._id);

    return res.status(200).json({
      totalApprovedPosts,
      averageSentimentScore: parseFloat(averageSentimentScore),
      sentimentBreakdown,
      topCategories,
    });
  } catch (error) {
    console.error('getSummary error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/insights/trends ────────────────────────────────────────────────
exports.getTrends = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = period === 'monthly' ? 30 : 7;
    const labels = [];
    const averageScores = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const agg = await Post.aggregate([
        {
          $match: {
            status: 'approved',
            createdAt: { $gte: dayStart, $lte: dayEnd },
          },
        },
        { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
      ]);

      const label = dayStart.toLocaleDateString('en-IN', {
        weekday: days === 7 ? 'short' : undefined,
        month: days === 30 ? 'short' : undefined,
        day: 'numeric',
      });
      labels.push(label);
      averageScores.push(parseFloat((agg[0]?.avg || 0).toFixed(2)));
    }

    return res.status(200).json({ labels, averageScores });
  } catch (error) {
    console.error('getTrends error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/insights/categories ────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const agg = await Post.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$category',
          postCount: { $sum: 1 },
          averageSentiment: { $avg: '$sentimentScore' },
        },
      },
      { $sort: { postCount: -1 } },
    ]);

    const categories = agg.map((c) => ({
      name: c._id,
      postCount: c.postCount,
      averageSentiment: parseFloat(c.averageSentiment.toFixed(2)),
    }));

    // Emotion frequency across all posts
    const emotionAgg = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $unwind: '$emotions' },
      { $group: { _id: '$emotions', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({ categories, emotionFrequency: emotionAgg });
  } catch (error) {
    console.error('getCategories error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
