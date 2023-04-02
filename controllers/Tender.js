const mongoose = require("mongoose");
const TenderSchema = require("../models/Tender");
const asyncHandler = require("../middlewares/async");

const CreateTender = asyncHandler(async (req, res, next) => {
    const result = await TenderSchema.create(
        {
            title: req.body.title,
            description: req.body.description,
            tenderee: req.session.user,
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

const GetTenders = asyncHandler(async (req, res, next) => {
    req.model = TenderSchema;
    next();
});

const DeleteTender = asyncHandler(async (req, res, next) => {
    await TenderSchema.deleteOne({ _id: req.body.tenderId });
    res.status(200).json({success: true});
})

exports.CreateTender = CreateTender;
exports.DeleteTender = DeleteTender;
exports.GetTenders = GetTenders;