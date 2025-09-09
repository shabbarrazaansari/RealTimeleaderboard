import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const ScoreForm = ({ onScoreUpdate, loading }) => {
  const [formData, setFormData] = useState({
    playerId: '',
    playerName: '',
    region: 'IN-North',
    mode: 'solo',
    delta: 100
  });

  const regions = [
    'IN-North', 'IN-South', 'IN-East', 'IN-West', 'IN-Central',
    'US-East', 'US-West', 'EU-West', 'EU-East', 'Asia-Pacific'
  ];

  const modes = ['solo', 'duo', 'squad', 'battle-royale', 'team-deathmatch'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'delta' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.playerId && formData.playerName) {
      onScoreUpdate(formData);
    }
  };

  const adjustDelta = (amount) => {
    setFormData(prev => ({
      ...prev,
      delta: Math.max(0, prev.delta + amount)
    }));
  };

  const generateRandomPlayer = () => {
    const names = ['Player', 'Gamer', 'Pro', 'Legend', 'Champion', 'Master', 'Elite', 'Ace'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomId = Math.random().toString(36).substr(2, 9);
    
    setFormData(prev => ({
      ...prev,
      playerId: `player_${randomId}`,
      playerName: `${randomName}_${randomId.slice(0, 4)}`
    }));
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Update Score</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="controls">
          <div className="control-group">
            <label>Player ID</label>
            <input
              type="text"
              name="playerId"
              value={formData.playerId}
              onChange={handleChange}
              placeholder="Enter player ID"
              required
            />
          </div>
          
          <div className="control-group">
            <label>Player Name</label>
            <input
              type="text"
              name="playerName"
              value={formData.playerName}
              onChange={handleChange}
              placeholder="Enter player name"
              required
            />
          </div>
          
          <div className="control-group">
            <label>Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Game Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
            >
              {modes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>Score Delta</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => adjustDelta(-10)}
                className="btn"
                style={{ padding: '8px', minWidth: 'auto' }}
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                name="delta"
                value={formData.delta}
                onChange={handleChange}
                min="0"
                style={{ textAlign: 'center', width: '80px' }}
              />
              <button
                type="button"
                onClick={() => adjustDelta(10)}
                className="btn"
                style={{ padding: '8px', minWidth: 'auto' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <label>&nbsp;</label>
            <button
              type="button"
              onClick={generateRandomPlayer}
              className="btn"
              style={{ background: '#28a745' }}
            >
              Random Player
            </button>
          </div>
          
          <div className="control-group">
            <label>&nbsp;</label>
            <button
              type="submit"
              className="btn"
              disabled={loading || !formData.playerId || !formData.playerName}
            >
              {loading ? 'Updating...' : 'Update Score'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScoreForm;
