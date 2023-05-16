const router = require("express").Router();

const {
  CreateTender,
  DeleteTender,
  GetTenders,
  GetApprovedTenders,
  ApproveTender,
  GetAllTenders
} = require('../controllers/Tender');

const { protect } = require("../middlewares/protect");
const { checkNecessaryParameters } = require('../middlewares/checkParams');
const { pagination, aggregatedPagination } = require('../middlewares/pagination');
const { setDocument, CheckBiddingTime } = require("../middlewares/helpers");
const Tender = require("../models/Tender");
const { PublishBid, GetTenderBids, SubscribeTender, GetBidByKey, GetTenderCandidates, SelectWinnerFromCandidates, TestSmartContract } = require("../controllers/Bid");

router.post(
    "/add",
    protect,
    checkNecessaryParameters([
        "title", 
        "description",
        "timeLimit",
        "startDate",
        "endDate",
        "category",
        "poolId"
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
    GetAllTenders,
    pagination
);

router.get(
    "/users", 
    protect,
    GetTenders,
    aggregatedPagination
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

router.get(
    '/candidates',
    protect,
    GetTenderCandidates,
    pagination
);

router.post(
    '/select-winner',
    protect,
    checkNecessaryParameters([
        'tenderId',
        'tendererId',
    ]),
    setDocument('tenderId', Tender),
    SelectWinnerFromCandidates
);

router.post(
    '/test-contract',
    protect,
    checkNecessaryParameters([
        'tenderId'
    ]),
    setDocument('tenderId', Tender),
    TestSmartContract
)

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
