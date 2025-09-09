import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

const Leaderboard = ({ leaderboard, loading, error, dateKey, mode, region }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-blue-500">#{rank}</span>;
    }
  };

  const formatScore = (score) => {
    return new Intl.NumberFormat().format(score);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div className="leaderboard-title">Loading...</div>
        </div>
        <div className="loading">
          <div>Fetching leaderboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <div className="leaderboard-title">Error</div>
        </div>
        <div className="error">
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="leaderboard-title">
          {mode?.charAt(0).toUpperCase() + mode?.slice(1)} Leaderboard
        </div>
        <div className="leaderboard-subtitle">
          {region ? `${region} • ` : ''}Today • {dateKey}
        </div>
      </div>
      
      {!leaderboard || leaderboard.length === 0 ? (
        <div className="empty">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div>No players yet. Be the first to score!</div>
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((player, index) => (
            <div key={`${player.playerId}-${index}`} className="leaderboard-item">
              <div className="rank">
                {getRankIcon(index + 1)}
              </div>
              <div className="player-info">
                <div className="player-name">{player.playerName}</div>
                <div className="player-details">
                  {player.region} • Last updated: {formatTime(player.updatedAt)}
                </div>
              </div>
              <div className="score">{formatScore(player.score)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
