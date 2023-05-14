const mongoose = require('mongoose');
const { verifyDocument } = require('../utils/verifyDocument');
const User = require('./User');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    rating: {
        type: Number,
        require: true
    }
})

RatingSchema.pre('save', async function (next) {
    try {
        await verifyDocument({ _id: this.user }, User, "User");
        next();
    }
    catch (err) {
        next(err);
    }
})

module.exports = mongoose.model('ratings', RatingSchema);