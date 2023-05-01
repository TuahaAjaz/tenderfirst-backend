const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PoolModel = new Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    minimumCost: {
        type: Number,
        required: true
    },
    maximumCost: {
        type: Number,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('pool', PoolModel);