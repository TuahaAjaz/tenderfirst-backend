const Error = require('../utils/httpError');

const checkNecessaryParameters = (parameters) => (req, res, next) => {
  let params = [];
  let flag = true;
  for (let i = 0; i < parameters.length; i++) {
    if (req.body[parameters[i]] === undefined) {
      params.push(parameters[i]);
      flag = false;
    }
  }
  if (flag) {
    return next();
  } else {
    next(new Error(params, 'missing-attributes', 403));
  }
};

const checkOptionalParameters = (parameters) => (req, res, next) => {
  for (const index in req.body.updates) {
    console.log(index);
    if (!parameters.includes(index)) {
      next(new Error(`${index} doesn't exist`, 'invalid-params', 403));
    }
  }
  next();
};

exports.checkNecessaryParameters = checkNecessaryParameters;
exports.checkOptionalParameters = checkOptionalParameters;
