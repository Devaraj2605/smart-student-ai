const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode || 500;

  if (res.headersSent) {
    return next(err);
  }

  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorMiddleware;
