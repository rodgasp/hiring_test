const express = require('express');
const { saveGameData, savedResults } = require('../controllers/memoryController');
const router = express.Router();

// Route to save game data
router.post('/save', saveGameData);
// Route to fetch game history by userID
router.get('/history/:userId', savedResults);
module.exports = router;
