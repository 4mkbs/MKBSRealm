const User = require("../models/User");

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // target user id
    if (id === req.user.id)
      return res
        .status(400)
        .json({ success: false, message: "Cannot send request to yourself" });
    const user = await User.findById(req.user.id);
    const target = await User.findById(id);
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.friends.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "Already friends" });
    if (user.sentRequests.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "Request already sent" });
    if (user.friendRequests.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "User already sent you a request" });
    user.sentRequests.push(id);
    target.friendRequests.push(req.user.id);
    await user.save();
    await target.save();
    res.json({ success: true, message: "Friend request sent" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // sender user id
    const user = await User.findById(req.user.id);
    const sender = await User.findById(id);
    if (!sender)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.friendRequests.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "No request from this user" });
    user.friendRequests = user.friendRequests.filter(
      (uid) => uid.toString() !== id
    );
    user.friends.push(id);
    sender.sentRequests = sender.sentRequests.filter(
      (uid) => uid.toString() !== req.user.id
    );
    sender.friends.push(req.user.id);
    await user.save();
    await sender.save();
    res.json({ success: true, message: "Friend request accepted" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Cancel a sent friend request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // target user id
    const user = await User.findById(req.user.id);
    const target = await User.findById(id);
    if (!target)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.sentRequests.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "No sent request to this user" });
    user.sentRequests = user.sentRequests.filter(
      (uid) => uid.toString() !== id
    );
    target.friendRequests = target.friendRequests.filter(
      (uid) => uid.toString() !== req.user.id
    );
    await user.save();
    await target.save();
    res.json({ success: true, message: "Friend request canceled" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Reject an incoming friend request
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // sender user id
    const user = await User.findById(req.user.id);
    const sender = await User.findById(id);
    if (!sender)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.friendRequests.includes(id))
      return res
        .status(400)
        .json({ success: false, message: "No request from this user" });
    user.friendRequests = user.friendRequests.filter(
      (uid) => uid.toString() !== id
    );
    sender.sentRequests = sender.sentRequests.filter(
      (uid) => uid.toString() !== req.user.id
    );
    await user.save();
    await sender.save();
    res.json({ success: true, message: "Friend request rejected" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Unfriend
exports.unfriend = async (req, res) => {
  try {
    const { id } = req.params; // friend user id
    const user = await User.findById(req.user.id);
    const friend = await User.findById(id);
    if (!friend)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.friends.includes(id))
      return res.status(400).json({ success: false, message: "Not friends" });
    user.friends = user.friends.filter((uid) => uid.toString() !== id);
    friend.friends = friend.friends.filter(
      (uid) => uid.toString() !== req.user.id
    );
    await user.save();
    await friend.save();
    res.json({ success: true, message: "Unfriended" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Get friends, requests, sent
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("friends", "id name firstName lastName avatar")
      .populate("friendRequests", "id name firstName lastName avatar")
      .populate("sentRequests", "id name firstName lastName avatar");
    res.json({
      success: true,
      data: {
        friends: user.friends,
        friendRequests: user.friendRequests,
        sentRequests: user.sentRequests,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
