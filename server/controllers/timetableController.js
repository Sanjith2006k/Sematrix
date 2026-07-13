const Subject = require('../models/Subject');
const TimetableEntry = require('../models/TimetableEntry');
const User = require('../models/User');

// --- Subjects ---

// @desc    Get all subjects for user
// @route   GET /api/timetable/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a subject
// @route   POST /api/timetable/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a subject name' });
    }

    const subject = await Subject.create({
      user: req.user.id,
      name,
      color: color || '#37AA9C',
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a subject (and associated timetable entries)
// @route   DELETE /api/timetable/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await TimetableEntry.deleteMany({ subject: subject._id });
    await subject.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Timetable Entries ---

// @desc    Get all timetable entries for user
// @route   GET /api/timetable/entries
// @access  Private
const getTimetableEntries = async (req, res) => {
  try {
    const entries = await TimetableEntry.find({ user: req.user.id }).populate('subject');
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a timetable entry (paint a block)
// @route   POST /api/timetable/entries
// @access  Private
const addTimetableEntry = async (req, res) => {
  try {
    const { subjectId, dayOfWeek, timeSlotIndex } = req.body;

    // Check if an entry already exists for this slot and delete it if so (overwrite)
    await TimetableEntry.findOneAndDelete({
      user: req.user.id,
      dayOfWeek,
      timeSlotIndex,
    });

    const entry = await TimetableEntry.create({
      user: req.user.id,
      subject: subjectId,
      dayOfWeek,
      timeSlotIndex,
    });

    const populatedEntry = await TimetableEntry.findById(entry._id).populate('subject');
    res.status(201).json(populatedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a timetable entry (erase a block)
// @route   DELETE /api/timetable/entries/:dayOfWeek/:timeSlotIndex
// @access  Private
const removeTimetableEntry = async (req, res) => {
  try {
    const { dayOfWeek, timeSlotIndex } = req.params;

    const entry = await TimetableEntry.findOneAndDelete({
      user: req.user.id,
      dayOfWeek: Number(dayOfWeek),
      timeSlotIndex: Number(timeSlotIndex),
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.status(200).json({ message: 'Entry removed', dayOfWeek, timeSlotIndex });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Time Slots ---

// @desc    Update user's time slots
// @route   PUT /api/timetable/slots
// @access  Private
const updateTimeSlots = async (req, res) => {
  try {
    const { timeSlots } = req.body;
    
    if (!Array.isArray(timeSlots)) {
      return res.status(400).json({ message: 'Invalid time slots format' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { timeSlots },
      { new: true }
    ).select('-password');

    res.status(200).json(user.timeSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  deleteSubject,
  getTimetableEntries,
  addTimetableEntry,
  removeTimetableEntry,
  updateTimeSlots
};
