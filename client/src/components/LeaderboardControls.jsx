import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';

const LeaderboardControls = ({ 
  mode, 
  region, 
  n, 
  onModeChange, 
  onRegionChange, 
  onNChange, 
  onRefresh, 
  loading 
}) => {
  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'IN-North', label: 'IN-North' },
    { value: 'IN-South', label: 'IN-South' },
    { value: 'IN-East', label: 'IN-East' },
    { value: 'IN-West', label: 'IN-West' },
    { value: 'IN-Central', label: 'IN-Central' },
    { value: 'US-East', label: 'US-East' },
    { value: 'US-West', label: 'US-West' },
    { value: 'EU-West', label: 'EU-West' },
    { value: 'EU-East', label: 'EU-East' },
    { value: 'Asia-Pacific', label: 'Asia-Pacific' }
  ];

  const modes = [
    { value: 'solo', label: 'Solo' },
    { value: 'duo', label: 'Duo' },
    { value: 'squad', label: 'Squad' },
    { value: 'battle-royale', label: 'Battle Royale' },
    { value: 'team-deathmatch', label: 'Team Deathmatch' }
  ];

  const topNOptions = [5, 10, 20, 50, 100];

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Filter className="w-5 h-5 text-blue-500" />
        <h2 style={{ margin: 0, color: '#333' }}>Leaderboard Filters</h2>
      </div>
      
      <div className="controls">
        <div className="control-group">
          <label>Game Mode</label>
          <select
            value={mode}
            onChange={(e) => onModeChange(e.target.value)}
            disabled={loading}
          >
            {modes.map(modeOption => (
              <option key={modeOption.value} value={modeOption.value}>
                {modeOption.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Region</label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            disabled={loading}
          >
            {regions.map(regionOption => (
              <option key={regionOption.value} value={regionOption.value}>
                {regionOption.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Top N Players</label>
          <select
            value={n}
            onChange={(e) => onNChange(parseInt(e.target.value))}
            disabled={loading}
          >
            {topNOptions.map(option => (
              <option key={option} value={option}>
                Top {option}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>&nbsp;</label>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardControls;
