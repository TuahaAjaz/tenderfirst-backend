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
const { setDocument, CheckBiddingTime } = require("../middlewares/helpers");
const Tender = require("../models/Tender");
const { PublishBid, GetTenderBids, SubscribeTender, GetBidByKey } = require("../controllers/Bid");

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
        "description",
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

router.post(
    "/add-bid",
    protect,
    checkNecessaryParameters([
        'tenderId',
        'estimatedCost',
        'estimatedDays',
        'experience',
        'contractAgreement',
        'comments'
    ]),
    setDocument('tenderId', Tender),
    CheckBiddingTime,
    PublishBid
);

router.get(
    "/bids", 
    protect,
    GetTenderBids
);

router.get(
    "/specific-bid", 
    protect,
    GetBidByKey
);

router.post(
    "/subscribe", 
    protect,
    setDocument('tenderId', Tender),
    checkNecessaryParameters([
        'tenderId'
    ]),
    SubscribeTender
);

router.get(
    "/approved", 
    protect,
    GetApprovedTenders,
    pagination
);

module.exports = router;
