const helmet = require("helmet");

// Custom sanitization function for NoSQL injection prevention
const sanitizeData = (data) => {
  if (typeof data === "string") {
    return data.replace(/\$/g, "").replace(/\./g, "");
  }
  if (typeof data === "object" && data !== null) {
    const sanitized = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const sanitizedKey = key.replace(/\$/g, "").replace(/\./g, "");
        sanitized[sanitizedKey] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  return data;
};

// Custom middleware for NoSQL injection sanitization
const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.params) req.params = sanitizeData(req.params);
  next();
};

// Simple XSS prevention - remove potentially dangerous characters
const xssPreventionMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key]
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;")
          .replace(/\//g, "&#x2F;");
      }
    });
  }
  next();
};

// Apply security middleware
const applySecurity = (app) => {
  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(helmet());

  // Custom data sanitization against NoSQL injection
  app.use(mongoSanitizeMiddleware);

  // Custom XSS prevention
  app.use(xssPreventionMiddleware);
};

module.exports = { applySecurity };
