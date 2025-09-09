    import React, { useState, useEffect, useCallback } from 'react';
import useSocket from './hooks/useSocket';
import Leaderboard from './components/Leaderboard';
import ScoreForm from './components/ScoreForm';
import LeaderboardControls from './components/LeaderboardControls';
import { Wifi, WifiOff } from 'lucide-react';

function App() {
  const { socket, isConnected, error: socketError } = useSocket();
  
  // State for leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateKey, setDateKey] = useState('');
  
  // State for filters
  const [mode, setMode] = useState('solo');
  const [region, setRegion] = useState('');
  const [n, setN] = useState(10);
  
  // State for score updates
  const [scoreUpdateLoading, setScoreUpdateLoading] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!socket) return;
    
    setLoading(true);
    setError(null);
    
    try {
      socket.emit('leaderboard:get', { mode, region, n }, (response) => {
        if (response.ok) {
          setLeaderboard(response.top);
          setDateKey(response.dateKey);
        } else {
          setError(response.error || 'Failed to fetch leaderboard');
        }
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to fetch leaderboard');
      setLoading(false);
    }
  }, [socket, mode, region, n]);

  // Handle score update
  const handleScoreUpdate = useCallback(async (scoreData) => {
    if (!socket) return;
    
    setScoreUpdateLoading(true);
    
    try {
      socket.emit('score:update', scoreData, (response) => {
        if (response.ok) {
          console.log('Score updated successfully:', response.current);
        } else {
          console.error('Score update failed:', response.error);
          setError(response.error || 'Failed to update score');
        }
        setScoreUpdateLoading(false);
      });
    } catch (err) {
      console.error('Score update error:', err);
      setError('Failed to update score');
      setScoreUpdateLoading(false);
    }
  }, [socket]);

  // Listen for leaderboard changes
  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardChange = (data) => {
      // Only update if it matches current filters
      if (data.mode === mode && data.region === region) {
        setLeaderboard(data.top);
        setDateKey(data.dateKey);
      }
    };

    socket.on('leaderboard:changed', handleLeaderboardChange);

    return () => {
      socket.off('leaderboard:changed', handleLeaderboardChange);
    };
  }, [socket, mode, region]);

  // Fetch leaderboard when filters change
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected && !loading) {
        fetchLeaderboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, loading, fetchLeaderboard]);

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>🏆 Real-time Leaderboard</h1>
          <p>Live updates powered by WebSockets • MongoDB • React</p>
        </div>

        {/* Connection Status */}
        <div className={`status ${!isConnected ? 'disconnected' : ''}`}>
          <div className="status-indicator"></div>
          <div className="status-text">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 inline mr-2" />
                Connected to server
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 inline mr-2" />
                {socketError || 'Disconnected from server'}
              </>
            )}
          </div>
        </div>

        {/* Score Update Form */}
        <ScoreForm 
          onScoreUpdate={handleScoreUpdate}
          loading={scoreUpdateLoading}
        />

        {/* Leaderboard Controls */}
        <LeaderboardControls
          mode={mode}
          region={region}
          n={n}
          onModeChange={setMode}
          onRegionChange={setRegion}
          onNChange={setN}
          onRefresh={fetchLeaderboard}
          loading={loading}
        />

        {/* Leaderboard Display */}
        <Leaderboard
          leaderboard={leaderboard}
          loading={loading}
          error={error}
          dateKey={dateKey}
          mode={mode}
          region={region}
        />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255, 255, 255, 0.8)' }}>
          <p>Built with Node.js, Socket.io, MongoDB, and React</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Data resets daily at midnight IST • Real-time updates via WebSockets
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
