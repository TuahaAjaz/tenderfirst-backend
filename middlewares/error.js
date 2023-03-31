const { default: mongoose } = require('mongoose');
const ErrorResponse = require('../utils/httpError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log("inmsid");
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `That id doesn't exists`;
    error = new ErrorResponse(message, 'not-found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // const message = 'Duplicate field value entered';
    const message = Object.keys(err.keyPattern);
    error = new ErrorResponse(message, 'duplicate-values', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 'invalid-values', 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    code: error.code || 'server-error',
    message: error.message,
  });
};

module.exports = errorHandler;
