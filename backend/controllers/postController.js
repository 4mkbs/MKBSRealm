const Post = require("../models/Post");

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Private
const User = require("../models/User");
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort === "popularity" ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    // Get user's friends
    const user = await User.findById(req.user.id).select("friends");
    const ids = [req.user.id, ...(user.friends || [])];

    // Aggregate likes count for popularity sort
    const posts = await Post.aggregate([
      { $match: { author: { $in: ids.map((id) => typeof id === "object" ? id : new require('mongoose').Types.ObjectId(id)) } } },
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: sortBy },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count
    const total = await Post.countDocuments({ author: { $in: ids } });

    // Populate author and comments for each post
    const populatedPosts = await Post.populate(posts, [
      { path: "author", select: "firstName lastName email avatar" },
      { path: "comments.user", select: "firstName lastName avatar" },
    ]);

    // Transform posts for frontend
    const transformedPosts = populatedPosts.map((post) => ({
      id: post._id,
      author: post.author.firstName + " " + post.author.lastName,
      authorId: post.author._id,
      avatar: post.author.avatar,
      content: post.content,
      image: post.image,
      likes: post.likes.length,
      isLiked: post.likes.map(String).includes(String(req.user.id)),
      comments: post.comments.length,
      time: getTimeAgo(post.createdAt),
      createdAt: post.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: transformedPosts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching posts",
    });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      author: req.user.id,
      content,
      image,
    });

    // Populate author details
    await post.populate("author", "firstName lastName email avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        post: {
          id: post._id,
          author: post.author.firstName + " " + post.author.lastName,
          authorId: post.author._id,
          avatar: post.author.avatar,
          content: post.content,
          image: post.image,
          likes: 0,
          isLiked: false,
          comments: 0,
          time: "Just now",
          createdAt: post.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating post",
    });
  }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      data: {
        likes: post.likes.length,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking post",
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      user: req.user.id,
      text,
    });

    await post.save();

    // Populate the new comment's user
    await post.populate("comments.user", "firstName lastName avatar");

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: {
          id: newComment._id,
          user: {
            id: newComment.user._id,
            name: newComment.user.firstName + " " + newComment.user.lastName,
            avatar: newComment.user.avatar,
          },
          text: newComment.text,
          createdAt: newComment.createdAt,
        },
        commentsCount: post.comments.length,
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding comment",
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting post",
    });
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }

  return "Just now";
}

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
};
