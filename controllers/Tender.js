const mongoose = require("mongoose");
const TenderSchema = require("../models/Tender");
const asyncHandler = require("../middlewares/async");
const multichain = require("../multichainconfig");
const Tender = require("../models/Tender");
const { generateCode } = require("../utils/GenerateCode");

const CreateTender = asyncHandler(async (req, res, next) => {
    const code = await generateCode(Tender, 'T-')
    const result = await TenderSchema.create(
        {
            title: req.body.title,
            code: code,
            description: req.body.description,
            quantity: req.body.quantity,
            location: req.body.location,
            tenderee: req.session.user._id,
            pool: req.body.poolId,
            requiredExperience: req.body.requiredExperience,
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
    let result
    if(req.body.approval === 'approved') {
        const publishedTender = await multichain.create({
            type: "stream",
            name: tender.code,
            open: true,
            from: req.session.user.walletAddress,
            details: {
                description: tender.description
            }
        });
        result = await Tender.findOneAndUpdate(
            { _id: tender._id },
            { status: 'approved', txId: publishedTender },
            { new: true }
        );
        await multichain.subscribe({
            stream: result.txId,
            from: req.session.user.walletAddress
        });
    }
    else {
        result = await Tender.findOneAndUpdate(
            { _id: tender._id },
            { status: 'rejected' },
            { new: true }
        );
    }
    res.status(200).json({success: true, result: result});
})

const GetTenders = asyncHandler(async (req, res, next) => {
    req.model = TenderSchema;
    const query = req.query['category'];
    if (req.query["category"]) {
        if (req.query["category"]["in"] !== undefined) {
            req.query["category"]["in"] = req.query["category"]["in"].split(",");
        }
    }
    req.extraStages = [
        {
            $lookup: {
                from: 'pools',
                localField: 'pool',
                foreignField: '_id',
                as: 'pool'
            }
        },
        {
            $unwind: { path: '$pool', preserveNullAndEmptyArrays: true }
        },
        {
            $lookup: {
                from: 'catagories',
                localField: 'catagory',
                foreignField: '_id',
                as: 'categories'
            }
        },
        {
            $unwind: { path: '$categories', preserveNullAndEmptyArrays: true }
        },
    ]
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