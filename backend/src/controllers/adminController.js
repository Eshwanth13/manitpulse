const Post = require('../models/Post');
const { generateWeeklyReportContent } = require('../utils/ai');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ─── GET /api/admin/posts ─────────────────────────────────────────────────────
exports.getAdminPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && ['approved', 'rejected', 'deleted'].includes(status)) {
      query.status = status;
    }
    // If no status filter → return all posts (approved + rejected + deleted)

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-embedding'); // don't return embeddings even to admin

    const count = await Post.countDocuments(query);

    return res.status(200).json({
      posts,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error('getAdminPosts error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/admin/stats (dashboard overview) ───────────────────────────────
exports.getAdminStats = async (req, res) => {
  try {
    const totalApproved = await Post.countDocuments({ status: 'approved' });
    const totalRejected = await Post.countDocuments({ status: 'rejected' });
    const totalDeleted = await Post.countDocuments({ status: 'deleted' });
    const totalFlagged = await Post.countDocuments({ reportCount: { $gt: 0 }, status: 'approved' });

    const sentimentCounts = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$sentimentLabel', count: { $sum: 1 } } },
    ]);

    const sentimentBreakdown = {};
    sentimentCounts.forEach((s) => {
      if (s._id) sentimentBreakdown[s._id] = s.count;
    });

    const avgSentiment = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
    ]);

    const topCategories = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    const trendingTopics = await Post.aggregate([
      { $match: { status: 'approved' } },
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalApproved,
        totalRejected,
        totalDeleted,
        totalFlagged,
        sentimentBreakdown,
        averageSentimentScore: avgSentiment[0]?.avg?.toFixed(2) || 0,
        topCategories,
        trendingTopics,
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/admin/reports/generate ────────────────────────────────────────
exports.generateReport = async (req, res) => {
  try {
    // Collect data for the past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const weeklyPosts = await Post.find({
      status: 'approved',
      createdAt: { $gte: sevenDaysAgo },
    }).select('-embedding -anonymousToken');

    const totalPosts = weeklyPosts.length;
    const avgSentiment =
      totalPosts > 0
        ? (weeklyPosts.reduce((s, p) => s + p.sentimentScore, 0) / totalPosts).toFixed(2)
        : 0;

    // Per-category breakdown
    const categoryMap = {};
    weeklyPosts.forEach((p) => {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, sentimentSum: 0 };
      categoryMap[p.category].count++;
      categoryMap[p.category].sentimentSum += p.sentimentScore;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([name, v]) => ({
      name,
      postCount: v.count,
      averageSentiment: (v.sentimentSum / v.count).toFixed(2),
    }));

    // Top topics
    const topicCount = {};
    weeklyPosts.forEach((p) => p.topics.forEach((t) => { topicCount[t] = (topicCount[t] || 0) + 1; }));
    const topTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Emotion distribution
    const emotionCount = {};
    weeklyPosts.forEach((p) => p.emotions.forEach((e) => { emotionCount[e] = (emotionCount[e] || 0) + 1; }));

    const rejectedCount = await Post.countDocuments({
      status: 'rejected',
      createdAt: { $gte: sevenDaysAgo },
    });
    const flaggedCount = await Post.countDocuments({
      reportCount: { $gt: 0 },
      status: 'approved',
      createdAt: { $gte: sevenDaysAgo },
    });

    const aggregatedData = {
      period: `${sevenDaysAgo.toDateString()} – ${new Date().toDateString()}`,
      totalPostsThisWeek: totalPosts,
      averageSentimentScore: avgSentiment,
      categoryBreakdown,
      topTopics,
      emotionDistribution: emotionCount,
      fakeRejectionCount: rejectedCount,
      reportFlagCount: flaggedCount,
      approvalRate:
        totalPosts + rejectedCount > 0
          ? (((totalPosts / (totalPosts + rejectedCount)) * 100).toFixed(1) + '%')
          : 'N/A',
    };

    // Generate content via Gemini
    const reportContent = await generateWeeklyReportContent(aggregatedData);

    // Build PDF using pdfkit
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const reportId = `report_${Date.now()}`;
    const filePath = path.join(reportsDir, `${reportId}.pdf`);

    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Title
      doc.fontSize(22).font('Helvetica-Bold').text('CampusVani AI — Weekly Sentiment Report', { align: 'center' });
      doc.fontSize(10).font('Helvetica').fillColor('#666').text(`MANIT Bhopal  |  ${aggregatedData.period}`, { align: 'center' });
      doc.moveDown(2);

      // Helper for sections
      const section = (title, body) => {
        doc.fillColor('#000').fontSize(14).font('Helvetica-Bold').text(title);
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').fillColor('#333').text(body, { lineGap: 4 });
        doc.moveDown(1.5);
      };

      // 1. Executive Summary
      section('1. Executive Summary', reportContent.summary);

      // 2. Category Breakdown
      const catText = categoryBreakdown
        .map((c) => `• ${c.name}: ${c.postCount} posts, avg sentiment ${c.averageSentiment}`)
        .join('\n');
      section('2. Category Breakdown', catText || 'No data available.');

      // 3. Top Student Concerns
      section(
        '3. Top Student Concerns',
        reportContent.concerns.map((c, i) => `${i + 1}. ${c}`).join('\n')
      );

      // 4. Trend Analysis
      section('4. Trend Analysis', reportContent.trendAnalysis);

      // 5. Recommended Actions
      section(
        '5. Recommended Actions for Administration',
        reportContent.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')
      );

      // 6. Moderation Statistics
      const modText = [
        `Total posts this week: ${totalPosts}`,
        `AI approval rate: ${aggregatedData.approvalRate}`,
        `Fake/spam rejections: ${rejectedCount}`,
        `Community-flagged posts: ${flaggedCount}`,
        `Top topics: ${topTopics.map((t) => t.topic).join(', ') || 'None'}`,
      ].join('\n');
      section('6. Moderation Statistics', modText);

      doc.fontSize(8).fillColor('#aaa').text('Generated by CampusVani AI — Verified Anonymous Feedback Platform for MANIT Bhopal', {
        align: 'center',
      });

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return res.status(200).json({
      success: true,
      reportId,
      downloadUrl: `/api/admin/reports/download/${reportId}`,
    });
  } catch (error) {
    console.error('generateReport error:', error);
    return res.status(500).json({ success: false, message: `Report generation failed: ${error.message}` });
  }
};

// ─── GET /api/admin/reports/download/:id ─────────────────────────────────────
exports.downloadReport = (req, res) => {
  try {
    const { id } = req.params;
    // Sanitize ID to prevent path traversal
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(__dirname, '../../reports', `${safeId}.pdf`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeId}.pdf"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('downloadReport error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
