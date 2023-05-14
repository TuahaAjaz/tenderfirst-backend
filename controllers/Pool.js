const mongoose = require("mongoose");
const CategorySchema = require("../models/Categories");
const asyncHandler = require("../middlewares/async");
const Pool = require("../models/Pool");

const CreatePool = asyncHandler(async (req, res, next) => {
    const pools = await Pool
        .find({})
        .sort({ createdAt: -1 })
        .limit(1);
    let counter = 0;
    let stage;
    if (pools.length > 0) {
        counter = parseInt(pools[0].title.slice('P-'.length));
        stage = pools[0].stage + 1;
    }
    else {
        stage = 1;
    }
    const title = `P-${counter + 1}`;
    const result = await Pool.create(
        {
            title: title,
            minimumCost: req.body.minimumCost,
            maximumCost: req.body.maximumCost,
            stage: stage
        }
    );
    res.status(200).json({success: true, result: result});
});

const GetPools = asyncHandler(async (req, res, next) => {
    req.model = Pool;
    next();
});

const DeletePool = asyncHandler(async (req, res, next) => {
    await Pool.deleteOne({ _id: req.body.poolId });
    res.status(200).json({success: true});
})

exports.CreatePool = CreatePool;
exports.DeletePool = DeletePool;
exports.GetPools = GetPools;