const router = require("express").Router();

const {
  CreateTender,
  DeleteTender,
  GetTenders,
  GetApprovedTenders,
  ApproveTender
} = require('../controllers/Tender');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination } = require('../middlewares/pagination');
const { setDocument } = require("../middlewares/helpers");
const Tender = require("../models/Tender");

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
        "description",
        "financialStability",
        "requiredExperience",
        "timeLimit",
        "startDate",
        "endDate"
    ]), 
    CreateTender
);

router.post(
    "/approve",
    protect,
    checkNecessaryParameters([
        "tenderId",
        "approval"
    ]), 
    setDocument('tenderId', Tender),
    ApproveTender
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

router.get(
    "/approved", 
    protect,
    GetApprovedTenders,
    pagination
);

module.exports = router;
