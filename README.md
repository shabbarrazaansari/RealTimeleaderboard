# 🏆 Real-time Leaderboard System

A production-ready real-time leaderboard system built with Node.js, Socket.io, MongoDB, and React. Features live score updates, daily resets, and a beautiful responsive UI.

## ✨ Features

- **Real-time Updates**: Live leaderboard updates via WebSockets
- **Daily Resets**: Automatic daily reset at midnight IST using MongoDB TTL
- **Performance Optimized**: LRU cache for hot reads and compound indexes
- **Responsive UI**: Modern React frontend with beautiful design
- **Multiple Game Modes**: Support for solo, duo, squad, and more
- **Regional Filtering**: Filter leaderboards by region
- **REST API**: HTTP endpoints for testing and integration
- **Production Ready**: Error handling, validation, and monitoring

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd realTimeLeaderBoard_system
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Start MongoDB:**

   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (update MONGODB_URI in .env)
   ```

4. **Install server dependencies:**

   ```bash
   cd server
   npm install
   ```

5. **Install client dependencies:**

   ```bash
   cd ../client
   npm install
   ```

6. **Start the application:**

   ```bash
   # From root directory
   npm run dev

   # Or start individually:
   # Terminal 1: npm run server
   # Terminal 2: npm run client
   ```

7. **Open your browser:**
   ```
   http://localhost:5173
   ```

## 🏗️ Architecture

### Backend (Node.js + Express + Socket.io)

```
server/
├── models/
│   └── Score.js          # Mongoose schema with TTL
├── routes/
│   └── leaderboard.js    # REST API endpoints
├── socketHandlers/
│   └── leaderboardHandler.js  # Socket.io event handlers
├── utils/
│   └── cache.js          # LRU cache implementation
├── config/
│   └── database.js       # MongoDB connection
└── index.js              # Main server file
```

### Frontend (React + Vite)

```
client/
├── src/
│   ├── components/
│   │   ├── Leaderboard.jsx      # Leaderboard display
│   │   ├── ScoreForm.jsx        # Score update form
│   │   └── LeaderboardControls.jsx  # Filter controls
│   ├── hooks/
│   │   └── useSocket.js         # Socket.io hook
│   ├── App.jsx                  # Main app component
│   └── main.jsx                 # Entry point
└── index.html
```

## 🔌 API Reference

### Socket.io Events

#### Client → Server

**`score:update`**

```javascript
socket.emit(
  'score:update',
  {
    playerId: 'player_123',
    playerName: 'John Doe',
    region: 'IN-North',
    mode: 'solo',
    delta: 100,
  },
  (response) => {
    console.log(response); // { ok: true, current: {...} }
  }
);
```

**`leaderboard:get`**

```javascript
socket.emit(
  'leaderboard:get',
  {
    mode: 'solo',
    region: 'IN-North', // optional
    n: 10,
  },
  (response) => {
    console.log(response); // { ok: true, dateKey: '2024-01-01', top: [...] }
  }
);
```

#### Server → Client

**`leaderboard:changed`**

```javascript
socket.on('leaderboard:changed', (data) => {
  console.log(data); // { mode: 'solo', region: 'IN-North', dateKey: '2024-01-01', top: [...] }
});
```

### REST API Endpoints

**GET** `/api/leaderboard/top?mode=solo&region=IN-North&n=10`

```json
{
  "ok": true,
  "dateKey": "2024-01-01",
  "top": [
    {
      "playerId": "player_123",
      "playerName": "John Doe",
      "region": "IN-North",
      "mode": "solo",
      "score": 1500,
      "updatedAt": "2024-01-01T10:30:00.000Z"
    }
  ]
}
```

**POST** `/api/leaderboard/score/update`

```json
{
  "playerId": "player_123",
  "playerName": "John Doe",
  "region": "IN-North",
  "mode": "solo",
  "delta": 100
}
```

**GET** `/api/leaderboard/stats?mode=solo&region=IN-North`

```json
{
  "ok": true,
  "stats": {
    "totalPlayers": 150,
    "totalScore": 250000,
    "dateKey": "2024-01-01",
    "mode": "solo",
    "region": "IN-North"
  }
}
```

## 🗃️ Database Schema

### Scores Collection

```javascript
{
  playerId: String,       // Unique player identifier
  playerName: String,     // Display name
  region: String,         // e.g., "IN-North"
  mode: String,           // e.g., "solo", "duo"
  score: Number,          // Cumulative for today (IST)
  dateKey: String,        // YYYY-MM-DD (IST day)
  expiresAt: Date,        // TTL at next midnight IST
  updatedAt: Date
}
```

### Indexes

- **Unique daily doc per player/mode**: `{ playerId: 1, mode: 1, dateKey: 1 }`
- **Covering index for top-N queries**: `{ mode: 1, region: 1, score: -1, updatedAt: 1 }`
- **TTL index**: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`

## ⚡ Performance Features

- **LRU Cache**: 3-second TTL cache for hot leaderboard reads
- **Compound Indexes**: Optimized database queries
- **Atomic Updates**: `findOneAndUpdate` with `$inc` for race-condition safety
- **Connection Pooling**: Efficient MongoDB connections
- **Auto-reconnection**: Robust Socket.io client with retry logic

## 🕰️ Daily Reset Logic

- **IST Timezone**: All operations use Asia/Kolkata timezone
- **Date Key**: `YYYY-MM-DD` format for daily partitioning
- **TTL Index**: Documents automatically expire at next midnight IST
- **Clean Slate**: Fresh leaderboard every day

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start both server and client
npm run server       # Start server only
npm run client       # Start client only

# Production
npm run build        # Build client for production
npm start           # Start production server
```

### Environment Variables

```bash
PORT=3001                           # Server port
MONGODB_URI=mongodb://localhost:27017/leaderboard  # MongoDB connection
CLIENT_URL=http://localhost:5173    # Client URL for CORS
NODE_ENV=development                # Environment
```

## 🚀 Deployment

### Using Docker (Optional)

```dockerfile
# Dockerfile for server
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Use PM2 or similar for process management
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates

## 📊 Monitoring

- **Health Check**: `GET /health`
- **Connection Status**: Real-time in UI
- **Error Logging**: Console and error boundaries
- **Performance**: LRU cache hit rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

- Check the console logs for errors
- Verify MongoDB connection
- Ensure all dependencies are installed
- Check environment variables

---

**Built with ❤️ using Node.js, Socket.io, MongoDB, and React**
