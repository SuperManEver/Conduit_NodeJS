//REQUESTED PAGE IS NOT FOUND
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

//ERROR HANDLER
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const info = {
    message: err.message,
  };
  if (process.env.NODE_ENV === 'development') {
    info.stack = err.stack;
  }
  res.json(info);
};

module.exports = {
  notFound,
  errorHandler,
};
