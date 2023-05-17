const Tender = require("../models/Tender");
const { EvaluateTenderBids } = require("./Bid");

const CheckTendersEvaluationTime = async () => {
    const tenders = await Tender.find({status: 'approved'});
    tenders.map(async (tender) => {
        if(tender.endDate < new Date()) {
            await EvaluateTenderBids(tender);
        }
        else {
            //do nothing
        }
    })
}

exports.CheckTendersEvaluationTime = CheckTendersEvaluationTime;