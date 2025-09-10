// server/db/connect.js
const mongoose = require('mongoose');

let isIndexesEnsured = false; // guard to avoid re-ensuring on hot reloads

const connectDB = async () => {
    try {
        // Use MONGODB_URI directly or build from individual variables
        const mongoURI = process.env.MONGODBURI ||
            (process.env.MONGO_USER && process.env.MONGO_PASS && process.env.MONGO_HOST && process.env.MONGO_DB
                ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`
                : 'mongodb://localhost:27017/leaderboard');


        console.log('🔍 Environment Variables Debug:');
        console.log('MONGODB_URI:', process.env.MONGODBURI ? '***hidden***' : 'undefined');
        console.log('MONGO_USER:', process.env.MONGO_USER);
        console.log('MONGO_PASS:', process.env.MONGO_PASS ? '***hidden***' : 'undefined');
        console.log('MONGO_DB:', process.env.MONGO_DB);
        console.log('MONGO_HOST:', process.env.MONGO_HOST);
        console.log('mongoURI →', mongoURI);

        // Modern Mongoose 7+ connect (no deprecated options)
        await mongoose.connect(mongoURI, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 8000,
        });

        console.log('✅ MongoDB connected successfully');

        // Ensure indexes once per process
        if (!isIndexesEnsured) {
            const col = mongoose.connection.db.collection('scores');
            await col.createIndex({ playerId: 1, mode: 1, dateKey: 1 }, { unique: true });
            await col.createIndex({ mode: 1, region: 1, score: -1, updatedAt: 1 });
            await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            console.log('✅ Database indexes ensured');
            isIndexesEnsured = true;
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed');
    process.exit(0);
});

module.exports = connectDB;
