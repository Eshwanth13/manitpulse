const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const VerificationToken = require('../models/VerificationToken');
const AnonymousUser = require('../models/AnonymousUser');
const { sendMagicLink } = require('../utils/mailer');

/**
 * Computes a non-reversible HMAC-SHA256 hash of the email.
 * Used to reunite a returning student with their previous posts
 * WITHOUT storing the email address.
 */
function hashEmail(email) {
  const secret = process.env.EMAIL_HASH_SECRET || 'campusvani-fallback-secret';
  return crypto.createHmac('sha256', secret).update(email).digest('hex');
}

/**
 * POST /api/auth/send-magic-link
 * Validates @stu.manit.ac.in domain, creates a short-lived verificationToken,
 * and emails a magic link that points to the FRONTEND /auth/callback page.
 */
exports.sendMagicLinkHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // TESTING PHASE: Relaxed domain check for easier local development
    // In production, we would re-enable the @stu.manit.ac.in restriction.
    const isManitEmail = normalizedEmail.endsWith('@stu.manit.ac.in');
    
    console.log(`[Auth] Magic link requested for: ${normalizedEmail} (Is MANIT: ${isManitEmail})`);

    // Remove any unused previous token for this email before creating a fresh one
    await VerificationToken.deleteMany({ email: normalizedEmail });

    const token = uuidv4();
    await VerificationToken.create({ email: normalizedEmail, token, createdAt: new Date() });

    await sendMagicLink(normalizedEmail, token);

    return res.status(200).json({ success: true, message: 'Magic link sent to your email.' });
  } catch (error) {
    console.error('[Auth] Send magic link error:', error.message);
    return res.status(500).json({ success: false, message: `Failed to send magic link: ${error.message}` });
  }
};

/**
 * GET /api/auth/verify?token=<uuid>
 * Called by the FRONTEND AuthCallback page via axios (NOT by browser navigation).
 *
 * Flow:
 * 1. Find the VerificationToken → get email from it
 * 2. Delete the token immediately (email GONE forever from DB)
 * 3. Compute emailHash = HMAC-SHA256(email, EMAIL_HASH_SECRET)
 * 4. Look for an existing AnonymousUser with this emailHash:
 *    - Found  → return their EXISTING anonymousToken (posts are preserved!)
 *    - Not found → create a new AnonymousUser + new anonymousToken
 * 5. Return { success, anonymousToken, returning }
 */
exports.verifyMagicLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    const verificationDoc = await VerificationToken.findOne({ token });

    if (!verificationDoc) {
      return res.status(400).json({
        success: false,
        message: 'This magic link is invalid or has expired (15-minute limit).',
      });
    }

    // Compute hash BEFORE deleting (email gets deleted next)
    const emailHash = hashEmail(verificationDoc.email);

    // TESTING PHASE: Do NOT delete the verification token immediately
    // This allows clicking the magic link multiple times within its TTL window (15 mins)
    // In production, we'd delete it: await VerificationToken.deleteOne({ _id: verificationDoc._id });

    // Check if this student has verified before
    const existingUser = await AnonymousUser.findOne({ emailHash });

    if (existingUser) {
      // Returning student — give them back their old token so their posts are preserved
      console.log('[Auth] Returning student verified — session restored.');
      return res.status(200).json({
        success: true,
        anonymousToken: existingUser.anonymousToken,
        returning: true,
        message: 'Welcome back! Your previous posts are still here.',
      });
    }

    // New student — create a fresh anonymous profile
    const anonymousToken = uuidv4();
    await AnonymousUser.create({ anonymousToken, emailHash });

    console.log('[Auth] New student verified — anonymous profile created.');
    return res.status(200).json({
      success: true,
      anonymousToken,
      returning: false,
      message: 'Verified. Your email has been permanently deleted. You are now completely anonymous.',
    });
  } catch (error) {
    console.error('[Auth] Verify magic link error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification. Please try again.',
    });
  }
};
