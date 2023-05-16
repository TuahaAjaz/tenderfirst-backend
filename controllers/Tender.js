const mongoose = require("mongoose");
const TenderSchema = require("../models/Tender");
const asyncHandler = require("../middlewares/async");
const multichain = require("../multichainconfig");
const Tender = require("../models/Tender");
const Pool = require('../models/Pool');
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
    let pool;
    const filters = {};

    if(req.query.pool) {
        pool = await Pool.findOne({ _id: req.query.pool });
        filters['pool.stage'] = { $lte: pool.stage } 
    }
    if(req.query.title) {
        filters['title'] = { $regex: req.query.title, $options: 'i' }
    }
    if (req.query["category"]) {
        req.query["category"] = req.query["category"].split(",");
        req.query["category"] = req.query["category"].map((category) => {
            return mongoose.Types.ObjectId(category);
        })
        filters['category._id'] = {
            "$in": req.query['category']
        }
    }
    filters['status'] = 'approved';
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
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $match: filters
        }
    ]
    next();
});

const GetAllTenders = asyncHandler(async (req, res, next) => {
    req.model = Tender;
    next();
})

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
exports.GetAllTenders = GetAllTenders;