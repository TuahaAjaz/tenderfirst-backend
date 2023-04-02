const router = require("express").Router();

const {
  CreateTender,
  DeleteTender,
  GetTenders
} = require('../controllers/Tender');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
        "description",
        "financialStability",
        "requiredExperience",
        "expectedCost",
        "timeLimit",
        "startDate",
        "endDate"
    ]), 
    CreateTender
);

router.post(
    "/delete",
    protect,
    checkNecessaryParameters([
        "tenderId"
    ]), 
    DeleteTender
);

router.get(
    "/", 
    protect,
    GetTenders,
    pagination
);

module.exports = router;
