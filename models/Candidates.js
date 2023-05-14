const mongoose = require('mongoose');
const { verifyDocument } = require('../utils/verifyDocument');
const Tender = require('./Tender');
const User = require('./User');
const Schema = mongoose.Schema;

const CandidatesSchema = new Schema({
    tenderer: [{
        type: Schema.Types.ObjectId,
        ref: 'users',
        autopopulate: true
    }],
    tender: {
        type: Schema.Types.ObjectId,
        ref: 'tenders',
        autopopulate: true
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