const mongoose = require('mongoose');
const crypto = require('crypto');
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
        if(bid && bid.length > 0) {
            bid[0].data = JSON.parse(Buffer.from(bid[0].data, "hex").toString());
            res.status(200).json({success: true, result: bid});
        }
        else {
            res.status(200).json({success: true, result: bid});
        }
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

const GetTenderCandidates = asyncHandler(async (req, res, next) => {
    req.model = Candidates;
    next();
})

const SelectWinnerFromCandidates = asyncHandler(async (req, res, next) => {
    const tender = req.document;
    await Tender.findOneAndUpdate(
        { _id: tender._id },
        { status: 'active', tenderer: req.body.tendererId },
        { new: true }
    );
    const candidates = await Candidates.find({ tender: tender._id });
    const winner = candidates.map((candidate) => {
        if(candidate.tenderer._id === req.body.tendererId) {
            return candidate;
        }
    })
    const obj = {
        user: winner.tenderer,
        bid: winner.bid,
        score: winner.score
    }
    const address = await multichain.listAddresses();
    await multichain.publishFrom({
        from: address[0].address,
        stream: tender.txId,
        key: 'winner',
        data: Buffer.from(JSON.stringify(obj), "utf8").toString("hex")
    })
})

const TestSmartContract = asyncHandler(async (req, res, next) => {
    const tender = req.document;
    await EvaluateTenderBids(tender);
    res.status(200).json({success: true});
})

function normalizePreferablyLess(value, min, max) {
    return (max - value) / (max - min);
}
  
  // Normalize a value based on a range (preferably more value)
function normalizePreferablyMore(value, min, max) {
    return (value - min) / (max - min);
}

function generateRandomNumber(min, max) {
    const range = max - min + 1;
    const randomBytes = crypto.randomBytes(4); // 4 bytes (32 bits)
    const randomValue = randomBytes.readUInt32BE(0);
    return min + (randomValue % range);
}

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
        let scoreBoard = [];
        let costWeight = 0.3, daysWeight = 0.3, experienceWeight = 0.2, ratingWeight = 0.2; 
        let minCost = bids[0].data.estimatedCost, minDays = bids[0].data.estimatedDays, minExperience = bids[0].data.estimatedDays, minRating = 5 //Highest Rating;
        let maxCost = 0, maxDays = 0, maxExperience = 0, maxRating = 0;
        // Loop to choose maximum and minimum value for normalization
        for(let i = 0; i < bids.length; i++) {
            let user = await User.findOne({ _id: bids[i].keys[0] })
            bids[i]['data']['user'] = user;
            if (bids[i].data.estimatedCost < minCost) {
                minCost = bids[i].data.estimatedCost;
            }
            if (bids[i].data.estimatedCost > maxCost) {
                maxCost = bids[i].data.estimatedCost;
            }
            if (bids[i].data.estimatedDays < minDays) {
                minDays = bids[i].data.estimatedDays;
            }
            if (bids[i].data.estimatedDays > maxDays) {
                maxDays = bids[i].data.estimatedDays;
            }
            if (bids[i].data.experience > maxExperience) {
                maxExperience = bids[i].data.experience;
            }
            if (bids[i].data.experience < minExperience) {
                minExperience = bids[i].data.experience;
            }
            if (user.rating > maxRating) {
                maxRating = user.rating;
            }
            if (user.rating < minRating) {
                minRating = user.rating;
            }
        };
        console.log(minCost, maxCost, minDays, maxDays, minExperience, maxExperience, minRating, maxRating);
        //loop to normalize the values and calculate scores;
        let maxScore = 0;
        bids.forEach(bid => {
            let estimatedCost, estimatedDays, experience, rating;
            if(maxCost ===  minCost) {
                estimatedCost = 0;
            }
            else {
                estimatedCost = normalizePreferablyLess(bid.data.estimatedCost, minCost, maxCost) * costWeight;
            }
            if(maxDays ===  minDays) {
                estimatedDays = 0;
            }
            else {
                estimatedDays = normalizePreferablyLess(bid.data.estimatedDays, minDays, maxDays) * daysWeight;
            }
            if(maxExperience ===  minExperience) {
                experience = 0;
            }
            else {
                experience = normalizePreferablyMore(bid.data.experience, minExperience, maxExperience) * experienceWeight;
            }
            if(maxRating === minRating) {
                rating = 0;
            }
            else {
                rating = normalizePreferablyMore(bid.data.user.rating, minRating, maxRating) * ratingWeight;
            }
            let score = estimatedCost + estimatedDays + experience + rating;
            bid.data['score'] = score;
            if(score > maxScore) {
                scoreBoard = [];
                scoreBoard.push(
                    bid.data
                )
                maxScore = score;
            }
            else if(maxScore === score) {
                scoreBoard.push(
                    bid.data
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
            const address = await multichain.listAddresses();
            await multichain.publishFrom({
                from: address[0].address,
                stream: tender.txId,
                key: 'winner',
                data: Buffer.from(JSON.stringify(scoreBoard[0]), "utf8").toString("hex")
            })
        }
        else if (scoreBoard.length > 1) {
            const randomNumber = generateRandomNumber(0, scoreBoard.length - 1);
            await Tender.findOneAndUpdate(
                { _id: tender._id },
                { status: 'active', tenderer: scoreBoard[randomNumber].user._id },
                { new: true }
            );
            const address = await multichain.listAddresses();
            await multichain.publishFrom({
                from: address[0].address,
                stream: tender.txId,
                key: 'winner',
                data: Buffer.from(JSON.stringify(scoreBoard[randomNumber]), "utf8").toString("hex")
            })
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
exports.GetTenderCandidates = GetTenderCandidates;
exports.SelectWinnerFromCandidates = SelectWinnerFromCandidates;
exports.TestSmartContract = TestSmartContract;
