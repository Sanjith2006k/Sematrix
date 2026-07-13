const mongoose = require('mongoose');

const timetableEntrySchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Subject',
    },
    dayOfWeek: {
      type: Number,
      required: true, // 0 for Sunday, 1 for Monday, etc.
    },
    timeSlotIndex: {
      type: Number,
      required: true, // Corresponds to the index in the User's timeSlots array
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
