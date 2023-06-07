const express = require('express');

const leaderboardController = require('../controllers/leaderboard');

const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard',authenticatemiddleware.authenticate, leaderboardController.getUserLeaderBoard);



module.exports = router;