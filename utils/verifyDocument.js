const HttpError = require('./httpError');

exports.verifyDocument = async (query, model, doc) => {
  if (query._id && !(await model.findOne(query))) {
    throw new HttpError(
      `${doc} with id ${query._id} doesn't exists`,
      'not-found',
      404
    );
  }
};
