const { LRUCache } = require('lru-cache');

// LRU cache for hot leaderboard reads
const leaderboardCache = new LRUCache({
  max: 100, // Maximum number of entries
  ttl: 3000, // 3 seconds TTL
  updateAgeOnGet: true,
  updateAgeOnHas: true
});

const getCacheKey = (mode, region, n) => {
  return `${mode}:${region || 'all'}:${n}`;
};

const getCachedLeaderboard = (mode, region, n) => {
  const key = getCacheKey(mode, region, n);
  return leaderboardCache.get(key);
};

const setCachedLeaderboard = (mode, region, n, data) => {
  const key = getCacheKey(mode, region, n);
  leaderboardCache.set(key, data);
};

const invalidateCache = (mode, region) => {
  // Invalidate all cache entries for this mode/region combination
  for (const [key] of leaderboardCache.entries()) {
    if (key.startsWith(`${mode}:${region || 'all'}:`)) {
      leaderboardCache.delete(key);
    }
  }
};

const clearAllCache = () => {
  leaderboardCache.clear();
};

module.exports = {
  getCachedLeaderboard,
  setCachedLeaderboard,
  invalidateCache,
  clearAllCache
};
