// Utility function to format time
function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - new Date(date)) / 1000);

  if (secondsAgo < 60) return "just now";
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 604800)}w ago`;

  return new Date(date).toLocaleDateString();
}

module.exports = { getTimeAgo };
