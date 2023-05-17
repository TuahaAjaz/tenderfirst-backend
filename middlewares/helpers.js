const HttpError = require('../utils/httpError');
const asyncHandler = require('./async');

const setDocument = (id, model) =>
  asyncHandler(async (req, res, next) => {
    const query = { _id: req.body[id] };
    req.document = await model.findOne(query);
    if (!req.document) {
      return next(new Error("That id doesn't exists", 'not-found', 404));
    }
    next();
  });

const CheckBiddingTime = asyncHandler(async (req, res, next) => {
  const tender = req.document;
  if(new Date() >= tender.startDate) {
    if(new Date() <= tender.endDate) {
      next();
    }
    else {
      return next(new HttpError("Bidding period has ended", "invalid-time", 403));
    }
  }
  else {
    return next(new HttpError("Bidding period not started yet", "invalid-time", 403));
  }
})

const CheckStatus = asyncHandler(async (req, res, next) => {
  const tender = req.document;
  if(tender.status !== 'approved') {
    return next(HttpError.invalidStatus("Bidding possible only on approved tenders"));
  }
  else {
    next();
  }
})

exports.setDocument = setDocument;
exports.CheckBiddingTime = CheckBiddingTime;
exports.CheckStatus = CheckStatus;