const express = require('express');
const router = express.Router();
const dsaController = require('../controllers/dsaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/problems', protect, dsaController.getProblems);
router.post('/problem-content', protect, dsaController.getProblemContent);
router.post('/video', protect, dsaController.getVideo);

router.post('/notes', protect, dsaController.saveProblemNote);
router.get('/notes', protect, dsaController.getProblemNotes);
router.put('/focus', protect, dsaController.updateFocusNote);

module.exports = router;
