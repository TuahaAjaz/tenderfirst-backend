const asyncHandler = require("../middlewares/async");
const Rating = require("../models/Rating");
const User = require("../models/User");

const CreateRating = asyncHandler(async (req, res, next) => {
    const result = await Rating.create({
        user: req.body.userId,
        rating: req.body.rating
    })
    const ratings = await Rating.find({ user: req.body.user });
    let sum = 0;
    ratings.map((rating) => {
        sum += rating.rating;
    })
    await User.findOneAndUpdate(
        { _id: req.body.userId },
        { rating: sum / ratings.length },
        { new: true }
    )
    res.status(200).json({success: true, result: result});
})

exports.CreateRating = CreateRating;