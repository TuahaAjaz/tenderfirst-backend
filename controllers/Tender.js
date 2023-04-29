const mongoose = require("mongoose");
const TenderSchema = require("../models/Tender");
const asyncHandler = require("../middlewares/async");
const multichain = require("../multichainconfig");
const Tender = require("../models/Tender");

const CreateTender = asyncHandler(async (req, res, next) => {
    const result = await TenderSchema.create(
        {
            title: req.body.title,
            description: req.body.description,
            quantity: req.body.quantity,
            tenderee: req.session.user._id,
            financialStability: req.body.financialStability,
            requiredExperience: req.body.requiredExperience,
            expectedCost: req.body.expectedCost,
            timeLimit: req.body.timeLimit,
            category: req.body.category,
            endDate: req.body.endDate,
            startDate: req.body.startDate
        }
    );
    res.status(200).json({success: true, result: result});
});

const ApproveTender = asyncHandler(async (req, res, next) => {
    const tender = req.document;
    if(req.body.approval === 'approved') {
        const publishedTender = await multichain.create({
            type: "stream",
            name: tender.title,
            open: true,
            from: req.session.user.walletAddress,
            details: {
                description: tender.description
            }
        }
        );
        tender = await Tender.findOneAndUpdate(
            { _id: tender._id },
            { status: 'approved', txId: publishedTender.createtxid },
            { new: true }
        );
    }
    else {
        tender = await Tender.findOneAndUpdate(
            { _id: tender._id },
            { txId: publishedTender.createtxid },
            { new: true }
        );
    }
    res.status(200).json({success: true, result: tender});
})

const GetTenders = asyncHandler(async (req, res, next) => {
    req.model = TenderSchema;
    next();
});

const GetApprovedTenders = asyncHandler(async (req, res, next) => {
    const tenders = await multichain.listStreams();
    res.status(200).json({success: true, result: tenders});
})

const DeleteTender = asyncHandler(async (req, res, next) => {
    await TenderSchema.deleteOne({ _id: req.body.tenderId });
    res.status(200).json({success: true});
})

exports.CreateTender = CreateTender;
exports.DeleteTender = DeleteTender;
exports.GetTenders = GetTenders;
exports.GetApprovedTenders = GetApprovedTenders;
exports.ApproveTender = ApproveTender;