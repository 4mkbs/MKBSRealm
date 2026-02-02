const express = require("express");
const router = express.Router();
const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const {
  validateCreatePost,
  validateComment,
  validateObjectId,
} = require("../middleware/validation");

// All routes are protected
router.use(protect);

router.route("/").get(getPosts).post(validateCreatePost, createPost);

router.route("/:id").delete(validateObjectId, deletePost);

router.put("/:id/like", validateObjectId, toggleLike);

router.post("/:id/comments", validateObjectId, validateComment, addComment);

router.post("/:id/comments", addComment);

module.exports = router;
