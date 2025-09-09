const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB connected successfully');

        // Create indexes
        await mongoose.connection.db.collection('scores').createIndex({ playerId: 1, mode: 1, dateKey: 1 }, { unique: true });
        await mongoose.connection.db.collection('scores').createIndex({ mode: 1, region: 1, score: -1, updatedAt: 1 });
        await mongoose.connection.db.collection('scores').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

        console.log('✅ Database indexes created');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
