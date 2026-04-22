const Post = require('../models/Post');
const AnonymousUser = require('../models/AnonymousUser');
const { getEmbedding, cosineSimilarity, moderateAndAnalyze, generatePersonalTips, isApiKeyConfigured } = require('../utils/ai');

const VALID_CATEGORIES = ['Placements', 'Academics', 'Faculty', 'Hostel', 'Mess Food', 'Mental Health'];

// Warn once at startup if GEMINI_API_KEY is not configured
if (!isApiKeyConfigured()) {
  console.warn(
    '\n⚠️  [CampusVani] GEMINI_API_KEY is not set or is still the placeholder.\n' +
    '   AI moderation, sentiment analysis, and fake detection will use auto-approve fallback.\n' +
    '   Add your key to backend/.env: GEMINI_API_KEY=AI...xxxx\n'
  );
}

// Rate limiting is disabled as per user request
async function checkAndUpdateRateLimit(anonymousToken) {
  return { allowed: true };
}

// ─── POST /api/posts ─────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { content, category, inputType = 'text', language = 'en' } = req.body;
    const anonymousToken = req.headers['x-anonymous-token'];

    // Auth check
    if (!anonymousToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No anonymous token provided.' });
    }

    // Input validation
    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Post must be at least 20 characters.' });
    }
    if (content.trim().length > 1000) {
      return res.status(400).json({ success: false, message: 'Post cannot exceed 1000 characters.' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    // Step 0: Find user doc (no rate limit check anymore)
    const user = await AnonymousUser.findOne({ anonymousToken });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session. Please verify email again.' });
    }

    // ── AI Pipeline ──

    // Step 1: Get embedding for cosine similarity
    const embedding = await getEmbedding(content.trim());

    // Step 2: Fetch recent embeddings from approved posts for duplicate check
    const recentPosts = await Post.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(parseInt(process.env.EMBEDDING_COMPARISON_POOL) || 50)
      .select('+embedding');

    const threshold = parseFloat(process.env.COSINE_SIMILARITY_THRESHOLD) || 0.82;
    let isSuspectedDuplicate = false;

    if (embedding.length > 0) {
      for (const p of recentPosts) {
        if (p.embedding && p.embedding.length > 0) {
          const sim = cosineSimilarity(embedding, p.embedding);
          if (sim > threshold) {
            isSuspectedDuplicate = true;
            break;
          }
        }
      }
    }

    // Step 3: Gemini moderation + sentiment (single call)
    const aiResult = await moderateAndAnalyze(content.trim(), isSuspectedDuplicate);

    const fakeThreshold = parseFloat(process.env.FAKE_PROBABILITY_THRESHOLD) || 0.65;
    const isRejected = !aiResult.approved || aiResult.fakeProbability > fakeThreshold;

    if (isRejected) {
      // Save rejected post for admin audit (not in public feed)
      await Post.create({
        anonymousToken,
        content: content.trim(),
        category,
        inputType,
        language,
        status: 'rejected',
        fakeProbability: aiResult.fakeProbability,
        aiReason: aiResult.reason,
        sentimentScore: aiResult.sentiment?.score || 0,
        sentimentLabel: aiResult.sentiment?.label || 'Neutral',
        emotions: aiResult.sentiment?.emotions || [],
        topics: aiResult.sentiment?.topics || [],
        embedding,
      });

      return res.status(400).json({
        success: false,
        status: 'rejected',
        message: 'Your post could not be published.',
        reason: aiResult.reason || 'Post did not pass moderation.',
      });
    }

    // Step 4: Save approved post
    const post = await Post.create({
      anonymousToken,
      content: content.trim(),
      category,
      inputType,
      language,
      status: 'approved',
      sentimentScore: aiResult.sentiment.score,
      sentimentLabel: aiResult.sentiment.label,
      emotions: aiResult.sentiment.emotions,
      topics: aiResult.sentiment.topics,
      aiReason: aiResult.reason,
      fakeProbability: aiResult.fakeProbability,
      embedding,
    });

    // Step 5: Update rate limit fields atomically
    await AnonymousUser.findOneAndUpdate(
      { anonymousToken },
      {
        $inc: { postCountToday: 1 },
        $set: {
          lastPostTimestamp: new Date(),
          lastResetDate: new Date().toISOString().slice(0, 10),
        },
      }
    );

    return res.status(201).json({
      success: true,
      status: 'approved',
      sentimentLabel: post.sentimentLabel,
      sentimentScore: post.sentimentScore,
      message: 'Your post is live.',
    });
  } catch (error) {
    console.error('createPost error:', error);
    return res.status(500).json({ success: false, message: 'Server error during post creation.' });
  }
};

// ─── GET /api/posts ──────────────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const query = { status: 'approved' };

    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-embedding -anonymousToken'); // never return these

    const count = await Post.countDocuments(query);

    return res.status(200).json({
      posts,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('getPosts error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/posts/my ───────────────────────────────────────────────────────
exports.getMyPosts = async (req, res) => {
  try {
    const anonymousToken = req.headers['x-anonymous-token'];
    if (!anonymousToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    // Validate token exists
    const user = await AnonymousUser.findOne({ anonymousToken });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Fetch approved + deleted (not rejected) posts for this token
    const posts = await Post.find({
      anonymousToken,
      status: { $in: ['approved', 'deleted'] },
    })
      .sort({ createdAt: -1 })
      .select('-embedding -anonymousToken');

    // Generate personalized AI tips from post history
    let aiTips = [];
    if (posts.length > 0) {
      aiTips = await generatePersonalTips(posts);
    }

    return res.status(200).json({ posts, aiTips });
  } catch (error) {
    console.error('getMyPosts error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE /api/posts/:id ───────────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const anonymousToken = req.headers['x-anonymous-token'];
    if (!anonymousToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const post = await Post.findOne({ _id: req.params.id, anonymousToken });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or not yours.' });
    }
    if (post.status === 'deleted') {
      return res.status(400).json({ success: false, message: 'Post already deleted.' });
    }

    // Soft delete — retained for admin audit trail
    post.status = 'deleted';
    await post.save();

    return res.status(200).json({ success: true, message: 'Your post has been removed from the feed.' });
  } catch (error) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── POST /api/posts/:id/report ──────────────────────────────────────────────
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Post reported. Thank you for helping keep the feed clean.',
    });
  } catch (error) {
    console.error('reportPost error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
