const express = require('express');
const { createRoom, getRooms, allocateRooms } = require('../controllers/roomController');
const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.post('/allocate', allocateRooms);

module.exports = router;
