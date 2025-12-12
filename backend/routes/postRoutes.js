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

// All routes are protected
router.use(protect);

router.route("/").get(getPosts).post(createPost);

router.route("/:id").delete(deletePost);

router.put("/:id/like", toggleLike);

router.post("/:id/comments", addComment);

module.exports = router;
