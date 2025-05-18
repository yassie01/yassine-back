const express = require('express');
const meeting = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.post('/create', auth, meeting.create);

// Get all meetings with pagination and filters
router.get('/', auth, meeting.index);

// Get single meeting
router.get('/view/:id', auth, meeting.view);

// Update meeting
router.put('/edit/:id', auth, meeting.update);

// Delete single meeting
router.delete('/delete/:id', auth, meeting.deleteMeeting);

// Bulk delete meetings
router.post('/deleteMany', auth, meeting.deleteMany);

module.exports = router;