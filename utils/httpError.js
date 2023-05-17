class HttpError extends Error {
  constructor(message, errorCode, statusCode) {
    super(message);
    this.message = message;
    this.code = errorCode;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static referenceError(message) {
    return new HttpError(message, 'reference-error', 400);
  }

  static notFound(message) {
    return new HttpError(message, 'not-found', 404);
  }

  static invalidStatus(message) {
    return new HttpError(message, 'invalid-status', 403);
  }

  static invalidCredentials() {
    return new HttpError(
      'Invalid username or password',
      'invalid-credentials',
      401
    );
  }
}

module.exports = HttpError;
