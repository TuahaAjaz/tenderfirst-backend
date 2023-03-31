const asyncHandler = require('./async');

const setDocument = (id, model) =>
  asyncHandler(async (req, res, next) => {
    console.log(id);
    const query = { _id: req.body[id] };
    req.document = await model.findOne(query);
    if (!req.document) {
      return next(new Error("That id doesn't exists", 'not-found', 404));
    }
    next();
  });

exports.setDocument = setDocument;