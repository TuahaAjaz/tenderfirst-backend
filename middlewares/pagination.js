const asyncHandler = require('../middlewares/async');

const pagination = asyncHandler(async (req, res) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // Create query string

  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  const filters = JSON.parse(queryStr);

  const populate = req.populate;
  const pageNumber = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sortBy;
  let selected;

  if (req.query.select) {
    selected = req.query.select;
  }

  if (req.query.sort) {
    sortBy = req.query.sort;
  } else {
    sortBy = '-createdAt';
  }
  const result = {};

  const model = req.model;

  const totalPosts = await model.countDocuments();
  let startIndex = (pageNumber - 1) * limit;
  result.totalPages = Math.ceil(totalPosts / limit);
  result.data = await model
    .find(filters)
    .sort(sortBy)
    .skip(startIndex)
    .limit(limit)
    .populate(populate)
    .select(selected)
    .exec(); 
  result.limit = limit;
  result.currentPage = pageNumber;
  res.json({ success: true, result: result });
});

exports.pagination = pagination;
