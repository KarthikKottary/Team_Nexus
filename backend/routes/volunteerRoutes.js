const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.get('/', volunteerController.getAllVolunteers);
router.post('/', volunteerController.addVolunteer);
router.delete('/:id', volunteerController.deleteVolunteer);

module.exports = router;
