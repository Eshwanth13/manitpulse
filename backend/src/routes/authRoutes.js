const express = require('express');
const { sendMagicLinkHandler, verifyMagicLink } = require('../controllers/authController');
const router = express.Router();

// POST /api/auth/send-magic-link
router.post('/send-magic-link', sendMagicLinkHandler);

// GET /api/auth/verify?token=<uuid>  — called when student clicks the magic link email
router.get('/verify', verifyMagicLink);

module.exports = router;
