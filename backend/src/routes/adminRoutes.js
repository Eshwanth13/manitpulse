const express = require('express');
const {
  getAdminPosts,
  getAdminStats,
  generateReport,
  downloadReport,
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// Download route is PUBLIC (browser <a> tag can't send headers)
// Auth is handled inside the controller via ?key= query param
router.get('/reports/download/:id', downloadReport);

// ALL other admin routes require Authorization: Bearer <ADMIN_SECRET_KEY>
router.use(adminAuth);

// Posts — all statuses (approved, rejected, deleted)
router.get('/posts', getAdminPosts);

// Stats for dashboard
router.get('/stats', getAdminStats);

// Report generation
router.post('/reports/generate', generateReport);

module.exports = router;
