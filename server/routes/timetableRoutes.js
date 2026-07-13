const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  deleteSubject,
  getTimetableEntries,
  addTimetableEntry,
  removeTimetableEntry,
  updateTimeSlots
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

router.route('/subjects')
  .get(protect, getSubjects)
  .post(protect, createSubject);

router.route('/subjects/:id')
  .delete(protect, deleteSubject);

router.route('/entries')
  .get(protect, getTimetableEntries)
  .post(protect, addTimetableEntry);

router.route('/entries/:dayOfWeek/:timeSlotIndex')
  .delete(protect, removeTimetableEntry);

router.route('/slots')
  .put(protect, updateTimeSlots);

module.exports = router;
