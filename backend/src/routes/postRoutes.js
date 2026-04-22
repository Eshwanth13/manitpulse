const express = require('express');
const {
  createPost,
  getPosts,
  getMyPosts,
  deletePost,
  reportPost,
} = require('../controllers/postController');
const router = express.Router();

// Public
router.get('/', getPosts);

// Authenticated (x-anonymous-token header)
router.post('/', createPost);
router.get('/my', getMyPosts);
router.delete('/:id', deletePost);
router.post('/:id/report', reportPost);

module.exports = router;
