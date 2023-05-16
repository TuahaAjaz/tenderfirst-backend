const mongoose = require('mongoose');
const { verifyDocument } = require('../utils/verifyDocument');
const Tender = require('./Tender');
const User = require('./User');
const Schema = mongoose.Schema;

const CandidatesSchema = new Schema({
    tenderer: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        autopopulate: true
    },
    tender: {
        type: Schema.Types.ObjectId,
        ref: 'tenders',
        autopopulate: true
    },
    bid: {
        type: Schema.Types.Map,
        of: Schema.Types.Mixed
    },
    score: {
        type: Number
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
});

CandidatesSchema.pre('save', async function(next){
    try{
        await verifyDocument({ _id: this.tender }, Tender, "Tender");
        this.tenderer.map(async (tenderer) => {
            await verifyDocument({ _id: tenderer }, User, "User");
        })
    }
    catch (err) {
        next(err);
    }
})

CandidatesSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('candidates', CandidatesSchema);