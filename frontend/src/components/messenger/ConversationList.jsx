import { useState, useEffect } from "react";
import { messagesAPI } from "../../services/api";

const ConversationList = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onStartConversation,
  isUserOnline,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await messagesAPI.searchUsers(searchQuery);
        setSearchResults(response.data || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (content, maxLength = 30) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chats</h2>
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search Messenger"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversation/Search List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery.trim().length >= 2 ? (
          // Search Results
          <div className="p-2">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
              <>
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  People
                </p>
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onStartConversation(user.id);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {isUserOnline(user.id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No users found
              </div>
            )}
          </div>
        ) : conversations.length > 0 ? (
          // Conversations List
          <div className="p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                  activeConversation?.id === conversation.id
                    ? "bg-blue-50"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.participant.avatar}
                    alt={conversation.participant.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {isUserOnline(conversation.participant.id) && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p
                      className={`font-semibold truncate ${
                        conversation.unreadCount > 0
                          ? "text-gray-900"
                          : "text-gray-800"
                      }`}
                    >
                      {conversation.participant.name}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <p
                      className={`text-sm truncate flex-1 ${
                        conversation.unreadCount > 0
                          ? "text-gray-900 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {conversation.lastMessage?.type === "call" ? (
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Call
                        </span>
                      ) : (
                        truncateMessage(
                          conversation.lastMessage?.content ||
                            "Start a conversation"
                        )
                      )}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount > 9
                          ? "9+"
                          : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-2">No conversations yet</p>
            <p className="text-sm">Search for friends to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
