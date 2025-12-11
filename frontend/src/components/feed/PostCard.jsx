import React from "react";
import { Card } from "../ui";

const PostCard = ({ post, onLike }) => {
  return (
    <Card className="overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={post.avatar}
          alt={post.author}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{post.author}</h3>
          <p className="text-xs text-gray-500">{post.time}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800">{post.content}</p>
      </div>

      {/* Post Stats */}
      <div className="px-4 py-2 flex justify-between text-sm text-gray-500 border-t border-gray-100">
        <span>👍 {post.likes} likes</span>
        <span>{post.comments} comments</span>
      </div>

      {/* Post Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => onLike(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition"
        >
          <span>👍</span>
          <span className="font-medium">Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition">
          <span>💬</span>
          <span className="font-medium">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 transition">
          <span>↗️</span>
          <span className="font-medium">Share</span>
        </button>
      </div>
    </Card>
  );
};

export default PostCard;
