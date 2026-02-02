// Standardized response format utility
const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = { sendSuccess, sendError };
