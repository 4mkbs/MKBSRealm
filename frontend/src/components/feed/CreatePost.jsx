import React from "react";
import { Card, Button } from "../ui";
import { useAuth } from "../../context/AuthContext";

const CreatePost = ({ postText, setPostText, onPost, posting = false }) => {
  const { user } = useAuth();

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-start gap-3">
        <img
          src={user?.avatar || "https://i.pravatar.cc/150?img=8"}
          alt="Your avatar"
          className="w-10 h-10 rounded-full"
        />
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder={`What's on your mind, ${
            user?.name?.split(" ")[0] || "friend"
          }?`}
          className="flex-1 resize-none border-none bg-gray-100 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1877f2]/30 min-h-[44px]"
          rows={1}
          onFocus={(e) => (e.target.style.borderRadius = "12px")}
          disabled={posting}
        />
      </div>
      <hr className="my-3 border-gray-200" />
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <span className="text-red-500">🎥</span>
            <span className="text-sm font-medium hidden sm:inline">
              Live video
            </span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <span className="text-green-500">🖼️</span>
            <span className="text-sm font-medium hidden sm:inline">
              Photo/video
            </span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
            <span className="text-yellow-500">😊</span>
            <span className="text-sm font-medium hidden sm:inline">
              Feeling
            </span>
          </button>
        </div>
        <Button onClick={onPost} disabled={!postText.trim() || posting}>
          {posting ? "Posting..." : "Post"}
        </Button>
      </div>
    </Card>
  );
};

export default CreatePost;
