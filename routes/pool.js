const router = require("express").Router();

const {
  CreatePool,
  DeletePool,
  GetPools
} = require('../controllers/Pool');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "minimumCost",
        "maximumCost" 
    ]), 
    CreatePool
);

router.post(
    "/delete",
    protect,
    checkNecessaryParameters([
        "poolId"
    ]), 
    DeletePool
);

router.get(
    "/", 
    protect,
    GetPools,
    pagination
);

module.exports = router;
