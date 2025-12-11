import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CreatePost, PostCard } from "../components/feed";
import { Button } from "../components/ui";

const INITIAL_POSTS = [
  {
    id: 1,
    author: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    time: "2 hours ago",
    content:
      "Just had an amazing day at the beach! 🏖️ The sunset was absolutely stunning.",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: "Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=2",
    time: "5 hours ago",
    content:
      "Excited to announce that I just got my dream job! Thank you everyone for your support! 🎉",
    likes: 156,
    comments: 42,
  },
  {
    id: 3,
    author: "Mike Johnson",
    avatar: "https://i.pravatar.cc/150?img=3",
    time: "Yesterday",
    content: "Coffee and coding - the perfect combination ☕💻",
    likes: 18,
    comments: 3,
  },
];

const Home = () => {
  const { user } = useAuth();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState(INITIAL_POSTS);

  const handlePost = () => {
    if (!postText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: user?.name || "You",
      avatar: "https://i.pravatar.cc/150?img=8",
      time: "Just now",
      content: postText,
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setPostText("");
  };

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#1877f2] to-[#42b72a] rounded-xl p-6 mb-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="mt-1 opacity-90">What's on your mind today?</p>
        </div>

        {/* Create Post */}
        <CreatePost
          postText={postText}
          setPostText={setPostText}
          onPost={handlePost}
        />

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <Button variant="secondary">Load more posts</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
