// const API_URL = "http://localhost:5000/api";
const API_URL = "https://mkbs-realm-server.vercel.app/api";
// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API response
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createPost: async (content, image = "") => {
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, image }),
    });
    return handleResponse(response);
  },

  toggleLike: async (postId) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  addComment: async (postId, text) => {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  deletePost: async (postId) => {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default { authAPI, postsAPI };
