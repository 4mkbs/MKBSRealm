const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  getProfile: async (id) => {
    const response = await fetch(`${API_URL}/auth/profile/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
};

// Posts API
export const postsAPI = {
  getPosts: async (page = 1, limit = 10, sort = "recency") => {
    const response = await fetch(
      `${API_URL}/posts?page=${page}&limit=${limit}&sort=${sort}`,
      {
        headers: getAuthHeaders(),
      }
    );
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

// Friend API
export const friendAPI = {
  sendRequest: async (id) => {
    const response = await fetch(`${API_URL}/friends/request/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  acceptRequest: async (id) => {
    const response = await fetch(`${API_URL}/friends/accept/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  cancelRequest: async (id) => {
    const response = await fetch(`${API_URL}/friends/cancel/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  rejectRequest: async (id) => {
    const response = await fetch(`${API_URL}/friends/reject/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  unfriend: async (id) => {
    const response = await fetch(`${API_URL}/friends/unfriend/${id}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  getFriends: async () => {
    const response = await fetch(`${API_URL}/friends/list`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getOrCreateConversation: async (participantId) => {
    const response = await fetch(
      `${API_URL}/messages/conversations/${participantId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await fetch(
      `${API_URL}/messages/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  sendMessage: async (conversationId, content, messageType = "text") => {
    const response = await fetch(
      `${API_URL}/messages/${conversationId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, messageType }),
      }
    );
    return handleResponse(response);
  },

  markAsRead: async (conversationId) => {
    const response = await fetch(`${API_URL}/messages/${conversationId}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteMessage: async (messageId) => {
    const response = await fetch(`${API_URL}/messages/messages/${messageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchUsers: async (query) => {
    const response = await fetch(
      `${API_URL}/messages/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

export default { authAPI, postsAPI, friendAPI, messagesAPI };
