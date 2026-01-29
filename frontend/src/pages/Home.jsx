import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CreatePost, PostCard } from "../components/feed";
import { Button } from "../components/ui";
import { postsAPI } from "../services/api";

const Home = () => {
  const { user } = useAuth();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("recency");

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts(1, sort);
    // eslint-disable-next-line
  }, [sort]);

  const fetchPosts = async (pageNum = 1, sortType = sort) => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts(pageNum, 10, sortType);
      const { posts: newPosts, pagination } = response.data;

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(pagination.page < pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;

    try {
      setPosting(true);
      const response = await postsAPI.createPost(postText);
      setPosts([response.data.post, ...posts]);
      setPostText("");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postsAPI.toggleLike(postId);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: response.data.likes,
                isLiked: response.data.isLiked,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, sort);
    }
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
          posting={posting}
        />

        {/* Sort Options */}
        <div className="flex justify-end mb-4">
          <select
            className="border rounded px-2 py-1"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recency">Most Recent</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1877f2] mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow">
            <p className="text-gray-500">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}

        {/* Load More */}
        {posts.length > 0 && hasMore && (
          <div className="text-center mt-6">
            <Button variant="secondary" onClick={loadMore} disabled={loading}>
              {loading ? "Loading..." : "Load more posts"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
