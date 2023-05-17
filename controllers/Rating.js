const asyncHandler = require("../middlewares/async");
const Rating = require("../models/Rating");
const User = require("../models/User");

const CreateRating = asyncHandler(async (req, res, next) => {
    const result = await Rating.create({
        user: req.body.userId,
        rating: req.body.rating
    })
    const ratings = await Rating.find({ user: req.body.userId });
    let avg = 0;
    if(ratings.length > 0) {      
        ratings.map((rating) => {
            avg += rating.rating;
        });
        avg = avg / ratings.length;
    }
    else {
        avg = result.rating;
    }
    await User.findOneAndUpdate(
        { _id: req.body.userId },
        { rating: avg },
        { new: true }
    )
    res.status(200).json({success: true, result: result});
})

exports.CreateRating = CreateRating;