const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/async');
const multichain = require('../multichainconfig');
const Tender = require('../models/Tender');

const PublishBid = asyncHandler(async (req, res, next) => {
    const obj = {
        estimatedCost: req.body.estimatedCost,
        estimatedDays: req.body.estimatedDays,
        experience: req.body.experience,
        contractAgreement: req.body.contractAgreement,
        comments: req.body.comments
    };
    const tender = req.document;
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
    const bids = await multichain.listStreamItems({
        stream: tender.txId,
        verbose: true
    });
    const result = bids.map((bid) => {
        bid.data = JSON.parse(Buffer.from(bid.data, "hex").toString());
        return bid;
    })
    res.status(200).json({success: true, result: result});
});

const SubscribeTender = asyncHandler(async(req, res, next) => {
    const tender = req.document;
    const result =  multichain.subscribe({
        stream: tender.txId,
        from: req.session.user.walletAddress
    });
    res.status(200).json({success: true, result: result});
})

exports.PublishBid = PublishBid;
exports.GetTenderBids = GetTenderBids;
exports.SubscribeTender = SubscribeTender;