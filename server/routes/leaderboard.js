const express = require('express');
const Score = require('../models/Score');
const { getCachedLeaderboard, setCachedLeaderboard, invalidateCache } = require('../utils/cache');

const router = express.Router();

// GET /api/leaderboard/top - Get top N scores
router.get('/top', async (req, res) => {
  try {
    const { mode, region, n = 10 } = req.query;

    if (!mode) {
      return res.status(400).json({ error: 'Mode parameter is required' });
    }

    // Check cache first
    const cached = getCachedLeaderboard(mode, region, parseInt(n));
    if (cached) {
      return res.json({ ok: true, ...cached });
    }

    // Get from database
    const leaderboard = await Score.getTopScores(mode, region, parseInt(n));
    const dateKey = Score.getISTDateKey();

    const result = {
      ok: true,
      dateKey,
      top: leaderboard
    };

    // Cache the result
    setCachedLeaderboard(mode, region, parseInt(n), result);

    res.json(result);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// POST /api/leaderboard/score/update - Update player score
router.post('/score/update', async (req, res) => {
  try {
    const { playerId, playerName, region, mode, delta } = req.body;

    // Validate required fields
    if (!playerId || !playerName || !region || !mode || typeof delta !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields: playerId, playerName, region, mode, delta'
      });
    }

    // Update score in database
    const updatedScore = await Score.updateScore(playerId, playerName, region, mode, delta);

    // Invalidate cache for this mode/region
    invalidateCache(mode, region);

    // Get updated leaderboard
    const leaderboard = await Score.getTopScores(mode, region, 10);

    res.json({
      ok: true,
      current: {
        playerId: updatedScore.playerId,
        playerName: updatedScore.playerName,
        score: updatedScore.score,
        rank: leaderboard.findIndex(p => p.playerId === playerId) + 1
      },
      leaderboard: {
        mode,
        region,
        dateKey: updatedScore.dateKey,
        top: leaderboard
      }
    });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// GET /api/leaderboard/stats - Get leaderboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { mode, region } = req.query;
    console.log("in the get stats")

    const query = { mode, dateKey: Score.getISTDateKey() };
    if (region) {
      query.region = region;
    }

    const totalPlayers = await Score.countDocuments(query);
    const totalScore = await Score.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$score' } } }
    ]);

    res.json({
      ok: true,
      stats: {
        totalPlayers,
        totalScore: totalScore[0]?.total || 0,
        dateKey: Score.getISTDateKey(),
        mode,
        region: region || 'all'
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
