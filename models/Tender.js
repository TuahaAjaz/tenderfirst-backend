const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { verifyDocument } = require('../utils/verifyDocument');
const Categories = require('./Categories');
const User = require('./User');

const TenderSchema = Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: false,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    tenderee: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
        autopopulate: true
    },
    pool: {
        type: Schema.Types.ObjectId,
        ref: 'pool',
        required: false,
        autopopulate: true
    },
    timeLimit: {
        type: Number,
        required: true
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: false,
        autopopulate: true
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['approved', 'rejected', 'pending', 'active', 'completed'],
        default: 'pending'
    },
    txId: {
        type: String,
    }
}, {timestamps: true});

TenderSchema.pre('save', async function() {
    try {
        await verifyDocument({ _id: this.tenderee }, User, "User");
        this.category.map(async (cat) => {
            await verifyDocument({ _id: cat }, Categories, "Category");
        })
    }
    catch (err) {
        next(err);
    }
})

TenderSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("tenders", TenderSchema);