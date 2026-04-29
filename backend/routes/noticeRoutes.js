const express = require('express');
const { createNotice, getNotices } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotices)
  .post(authorize('admin'), createNotice);

module.exports = router;
