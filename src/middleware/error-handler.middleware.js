/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${err.message}`);
  if (statusCode === 500) console.error(err.stack);

  res.status(statusCode).json({
    error: err.message,
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

module.exports = { errorHandler, notFound };
