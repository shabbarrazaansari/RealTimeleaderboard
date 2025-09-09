const Score = require('../models/Score');
const { getCachedLeaderboard, setCachedLeaderboard, invalidateCache } = require('../utils/cache');

const handleScoreUpdate = async (socket, data, callback) => {
  try {
    const { playerId, playerName, region, mode, delta } = data;
    
    // Validate required fields
    if (!playerId || !playerName || !region || !mode || typeof delta !== 'number') {
      return callback({ ok: false, error: 'Missing required fields or invalid delta' });
    }
    
    // Update score in database
    const updatedScore = await Score.updateScore(playerId, playerName, region, mode, delta);
    
    // Invalidate cache for this mode/region
    invalidateCache(mode, region);
    
    // Get updated leaderboard
    const leaderboard = await Score.getTopScores(mode, region, 10);
    
    // Broadcast leaderboard change to all clients
    socket.broadcast.emit('leaderboard:changed', {
      mode,
      region,
      dateKey: updatedScore.dateKey,
      top: leaderboard
    });
    
    // Send acknowledgment to the client
    callback({ 
      ok: true, 
      current: {
        playerId: updatedScore.playerId,
        playerName: updatedScore.playerName,
        score: updatedScore.score,
        rank: leaderboard.findIndex(p => p.playerId === playerId) + 1
      }
    });
    
  } catch (error) {
    console.error('Error updating score:', error);
    callback({ ok: false, error: 'Failed to update score' });
  }
};

const handleGetLeaderboard = async (socket, data, callback) => {
  try {
    const { mode, region, n = 10 } = data;
    
    // Validate required fields
    if (!mode) {
      return callback({ ok: false, error: 'Mode is required' });
    }
    
    // Check cache first
    const cached = getCachedLeaderboard(mode, region, n);
    if (cached) {
      return callback({ ok: true, ...cached });
    }
    
    // Get from database
    const leaderboard = await Score.getTopScores(mode, region, n);
    const dateKey = Score.getISTDateKey();
    
    const result = {
      dateKey,
      top: leaderboard
    };
    
    // Cache the result
    setCachedLeaderboard(mode, region, n, result);
    
    callback({ ok: true, ...result });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    callback({ ok: false, error: 'Failed to get leaderboard' });
  }
};

module.exports = {
  handleScoreUpdate,
  handleGetLeaderboard
};
