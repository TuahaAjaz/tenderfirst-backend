const User = require('../models/User');
const HttpError = require('../utils/httpError');

const protect = async (req, res, next) => {
  if (req.session.user) {
    const user = await User.findOne({ _id: req.session.user });
    if (user) {
      req.user = user;
      return next();
    }
  }
  return next(
    new HttpError('Tokens are missing or invalid', 'invalid-tokens', 401)
  );
};

exports.protect = protect;
