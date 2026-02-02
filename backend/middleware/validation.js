const { body, param, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.param, message: e.msg })),
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must be less than 500 characters"),
  body("birthday").optional().isISO8601().withMessage("Invalid date format"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  handleValidationErrors,
];

// Post validations
const validateCreatePost = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Post content is required")
    .isLength({ max: 5000 })
    .withMessage("Post cannot exceed 5000 characters"),
  body("image").optional().trim().isURL().withMessage("Invalid image URL"),
  handleValidationErrors,
];

const validateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
  handleValidationErrors,
];

const validateObjectId = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreatePost,
  validateComment,
  validateObjectId,
  handleValidationErrors,
};
