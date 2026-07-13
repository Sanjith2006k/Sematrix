const mongoose = require('mongoose');

const problemNoteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    problemSlug: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isSolved: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Ensure a user only has one note entry per problem
problemNoteSchema.index({ user: 1, problemSlug: 1 }, { unique: true });

module.exports = mongoose.model('ProblemNote', problemNoteSchema);
