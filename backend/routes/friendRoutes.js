const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.post("/request/:id", friendController.sendFriendRequest);
router.post("/accept/:id", friendController.acceptFriendRequest);
router.post("/cancel/:id", friendController.cancelFriendRequest);
router.post("/reject/:id", friendController.rejectFriendRequest);
router.post("/unfriend/:id", friendController.unfriend);
router.get("/list", friendController.getFriends);

module.exports = router;
