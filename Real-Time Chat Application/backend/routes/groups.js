const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Group = require("../models/Group");
const User = require("../models/User");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const creatorId = req.user.id;

  if (!name) return res.status(400).json({ msg: "Group name is required" });

  const joinId = Math.random().toString(36).substring(2, 10); // random 8-char ID

  const group = new Group({
    name,
    creator: creatorId,
    members: [creatorId],
    joinId
  });

  await group.save();
  res.json({ msg: "Group created", joinId });
});

router.post("/join", authMiddleware, async (req, res) => {
  const { joinId } = req.body;
  const userId = req.user.id;

  try {
    const group = await Group.findOne({ joinId });
    if (!group) return res.status(404).json({ msg: "Invalid Join ID" });

    if (group.members.includes(userId)) {
      return res.status(400).json({ msg: "You’ve already joined this group" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ msg: "Joined group", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


router.patch("/leave/:id", authMiddleware, async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ msg: "Group not found" });

  group.members = group.members.filter(id => id.toString() !== req.user.id);
  await group.save();

  res.json({ msg: "You left the group" });
});

router.get("/", authMiddleware, async (req, res) => {
  const groups = await Group.find({ members: req.user.id });
  res.json(groups);
});

module.exports = router;
