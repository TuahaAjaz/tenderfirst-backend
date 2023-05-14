const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/async');
const multichain = require('../multichainconfig');
const Tender = require('../models/Tender');
const User = require('../models/User');
const Candidates = require('../models/Candidates');
const HttpError = require('../utils/httpError');

const PublishBid = asyncHandler(async (req, res, next) => {
    const obj = {
        estimatedCost: req.body.estimatedCost,
        estimatedDays: req.body.estimatedDays,
        experience: req.body.experience,
        contractAgreement: req.body.contractAgreement,
        comments: req.body.comments
    };
    const tender = req.document;
    await multichain.subscribe({
        stream: tender.txId,
        from: req.session.user.walletAddress
    });
    const result = await multichain.publishFrom({
        from: req.session.user.walletAddress,
        stream: tender.txId,
        key: req.session.user._id,
        data: Buffer.from(JSON.stringify(obj), "utf8").toString("hex")
    })
    res.status(200).json({success: true, result});
});

const GetTenderBids = asyncHandler(async(req, res, next) => {
    const tender = await Tender.findOne({ _id: req.query.tenderId });
    if(tender) {
        const bids = await multichain.listStreamItems({
            stream: tender.txId,
            verbose: true
        });
        const result = bids.map((bid) => {
            bid.data = JSON.parse(Buffer.from(bid.data, "hex").toString());
            return bid;
        })
        res.status(200).json({success: true, result: result});
    }
    else {
        return next(HttpError.notFound(`Tender ${req.query.tenderId} not found`))
    }
});

const GetBidByKey = asyncHandler(async (req, res, next) => {
    const tender = await Tender.findOne( {_id: req.query.tenderId });
    if(tender) {
        const bid = await multichain.listStreamKeyItems({
            stream: tender.txId,
            key: req.query.key,
            verbose: true
        })
        bid[0].data = JSON.parse(Buffer.from(bid[0].data, "hex").toString());
        res.status(200).json({success: true, result: bid});
    }
    else {
        return next(HttpError.notFound(`Tender ${req.query.tenderId} not found`))
    }
})

const SubscribeTender = asyncHandler(async(req, res, next) => {
    const tender = req.document;
    const result =  multichain.subscribe({
        stream: tender.txId,
        from: req.session.user.walletAddress
    });
    res.status(200).json({success: true, result: result});
})

const EvaluateTenderBids = async (tender) => {
    try {
        const streamItems = await multichain.listStreamItems({
            stream: tender.txId,
            verbose: true
        });
        const bids = streamItems.map((bid) => {
            bid.data = JSON.parse(Buffer.from(bid.data, "hex").toString());
            return bid;
        });
        // console.log(bids);
        let scoreBoard = [];
        let costWeight = 0.3, daysWeight = 0.3, experienceWeight = 0.2, ratingWeight = 0.2; 
        let minCost = bids[0].data.estimatedCost, minDays = bids[0].data.estimatedDays, maxExperience = 0, maxRating = 0;
        // Loop to choose maximum and minimum value for normalization
        for(let i = 0; i < bids.length; i++) {
            let user = await User.findOne({ _id: bids[i].key })
            bids[i]['user'] = user;
            if (bids[i].data.estimatedCost < minCost) {
                minCost = bids[i].data.estimatedCost;
            }
            if (bids[i].data.estimatedDays < minDays) {
                minDays = bids[i].data.estimatedDays;
            }
            if (bids[i].data.experience > maxExperience) {
                maxExperience = bids[i].data.experience;
            }
            if (user.rating > maxRating) {
                maxRating = user.rating;
            }
        };
        console.log(minCost, minDays, maxExperience, maxRating);
        //loop to normalize the values and calculate scores;
        let maxScore = 0;
        bids.forEach(bid => {
            bid.data.estimatedCost = (bid.data.estimatedCost / minCost) * costWeight;
            bid.data.estimatedDays = (bid.data.estimatedDays / minDays) * daysWeight;
            if(maxExperience === 0) {
                bid.data.experience = 0;
            }
            else {
                bid.data.experience = (bid.data.experience / maxExperience) * experienceWeight;
            }
            if(maxRating === 0) {
                bid.data['rating'] = 0;
            }
            else {
                bid.data['rating'] = (bid.user.rating / maxRating) * ratingWeight;
            }
            let score = bid.data.estimatedCost + bid.data.estimatedDays + bid.data.experience + bid.data.rating;
            if(score > maxScore) {
                scoreBoard = [];
                scoreBoard.push(
                    {
                        user: bid.user,
                        score: bid.data.estimatedCost + bid.data.estimatedDays + bid.data.experience + bid.data.rating
                    }
                )
                maxScore = score;
            }
            else if(maxScore === score) {
                scoreBoard.push(
                    {
                        user: bid.user,
                        score: bid.data.estimatedCost + bid.data.estimatedDays + bid.data.experience + bid.data.rating
                    }
                )
            }
            else {
                //do nothing
            }
        });
        if(scoreBoard.length === 1) {
            await Tender.findOneAndUpdate(
                { _id: tender._id },
                { status: 'active', tenderer: scoreBoard[0].user._id },
                { new: true }
            );
            const obj = {
                "winner": scoreBoard[0],
            }
            const address = await multichain.listAddresses();
            await multichain.publishFrom({
                from: address[0].address,
                stream: tender.txId,
                key: 'winner',
                data: Buffer.from(JSON.stringify(obj), "utf8").toString("hex")
            })
        }
        else if (scoreBoard.length > 1) {
            let tenderers = scoreBoard.map((element) => {
                return element.user._id;
            })
            Candidates.create({
                tenderer: tenderers,
                tender: tender._id
            });
        }
        else {
            return;
        }
    }
    catch (err) {
        console.error(err);
    }
}

exports.PublishBid = PublishBid;
exports.GetTenderBids = GetTenderBids;
exports.SubscribeTender = SubscribeTender;
exports.EvaluateTenderBids = EvaluateTenderBids;
exports.GetBidByKey = GetBidByKey;