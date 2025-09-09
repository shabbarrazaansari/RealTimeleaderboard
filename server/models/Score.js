const mongoose = require('mongoose');
const moment = require('moment-timezone');

const scoreSchema = new mongoose.Schema({
    playerId: {
        type: String,
        required: true,
        index: true
    },
    playerName: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true,
        index: true
    },
    mode: {
        type: String,
        required: true,
        index: true
    },
    score: {
        type: Number,
        required: true,
        default: 0
    },
    dateKey: {
        type: String,
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes for performance
scoreSchema.index({ playerId: 1, mode: 1, dateKey: 1 }, { unique: true });
scoreSchema.index({ mode: 1, region: 1, score: -1, updatedAt: 1 });

// Static method to get IST date key
scoreSchema.statics.getISTDateKey = function () {
    return moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
};

// Static method to get next midnight IST
scoreSchema.statics.getNextMidnightIST = function () {
    return moment().tz('Asia/Kolkata').add(1, 'day').startOf('day').toDate();
};

// Static method to update or create score
scoreSchema.statics.updateScore = async function (playerId, playerName, region, mode, delta) {
    const dateKey = this.getISTDateKey();
    const expiresAt = this.getNextMidnightIST();

    return await this.findOneAndUpdate(
        { playerId, mode, dateKey },
        {
            $inc: { score: delta },
            $set: {
                playerName,
                region,
                dateKey,
                expiresAt,
                updatedAt: new Date()
            }
        },
        { upsert: true, new: true }
    );
};

// Static method to get top N scores
scoreSchema.statics.getTopScores = async function (mode, region, n = 10) {
    const dateKey = this.getISTDateKey();

    const query = { mode, dateKey };
    if (region) {
        query.region = region;
    }

    return await this.find(query)
        .sort({ score: -1, updatedAt: -1 })
        .limit(n)
        .select('playerId playerName region mode score updatedAt')
        .lean();
};

module.exports = mongoose.model('Score', scoreSchema);
