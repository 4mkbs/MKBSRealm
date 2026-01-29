import React, { useEffect, useState } from "react";
import { friendAPI } from "../services/api";
import { Button, Card } from "../components/ui";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await friendAPI.getFriends();
      setFriends(res.data.friends || []);
      setRequests(res.data.friendRequests || []);
      setSent(res.data.sentRequests || []);
    } catch (e) {
      setFriends([]);
      setRequests([]);
      setSent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAccept = async (id) => {
    await friendAPI.acceptRequest(id);
    fetchFriends();
  };
  const handleReject = async (id) => {
    await friendAPI.rejectRequest(id);
    fetchFriends();
  };
  const handleCancel = async (id) => {
    await friendAPI.cancelRequest(id);
    fetchFriends();
  };
  const handleUnfriend = async (id) => {
    await friendAPI.unfriend(id);
    fetchFriends();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Friends</h2>
        {friends.length === 0 ? <p>No friends yet.</p> : (
          <ul>
            {friends.map((f) => (
              <li key={f.id} className="flex items-center gap-2 mb-2">
                <img src={f.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                <span>{f.name}</span>
                <Button size="sm" variant="danger" onClick={() => handleUnfriend(f.id)}>Unfriend</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Friend Requests</h2>
        {requests.length === 0 ? <p>No incoming requests.</p> : (
          <ul>
            {requests.map((f) => (
              <li key={f.id} className="flex items-center gap-2 mb-2">
                <img src={f.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                <span>{f.name}</span>
                <Button size="sm" variant="success" onClick={() => handleAccept(f.id)}>Accept</Button>
                <Button size="sm" variant="danger" onClick={() => handleReject(f.id)}>Reject</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Sent Requests</h2>
        {sent.length === 0 ? <p>No sent requests.</p> : (
          <ul>
            {sent.map((f) => (
              <li key={f.id} className="flex items-center gap-2 mb-2">
                <img src={f.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                <span>{f.name}</span>
                <Button size="sm" variant="danger" onClick={() => handleCancel(f.id)}>Cancel</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Friends;
