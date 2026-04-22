const express = require('express');
const {
  getAdminPosts,
  getAdminStats,
  generateReport,
  downloadReport,
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// ALL admin routes require Authorization: Bearer <ADMIN_SECRET_KEY>
router.use(adminAuth);

// Posts — all statuses (approved, rejected, deleted)
router.get('/posts', getAdminPosts);

// Stats for dashboard
router.get('/stats', getAdminStats);

// Report generation and download
router.post('/reports/generate', generateReport);
router.get('/reports/download/:id', downloadReport);

module.exports = router;
