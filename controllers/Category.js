const mongoose = require("mongoose");
const CategorySchema = require("../models/Categories");
const asyncHandler = require("../middlewares/async");

const CreateCategory = asyncHandler(async (req, res, next) => {
    const result = await CategorySchema.create(
        {
            title: req.body.title,
        }
    );
    res.status(200).json({success: true, result: result});
});

const GetCategories = asyncHandler(async (req, res, next) => {
    req.model = CategorySchema;
    next();
});

const DeleteCategory = asyncHandler(async (req, res, next) => {
    await CategorySchema.deleteOne({ _id: req.body.categoryId });
    res.status(200).json({success: true});
})

exports.CreateCategory = CreateCategory;
exports.DeleteCategory = DeleteCategory;
exports.GetCategories = GetCategories;