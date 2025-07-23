const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("contacts", "_id name email");
    res.json(user.contacts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  const { email } = req.body;
  const currentUserId = req.user.id;

  try {
    const contactUser = await User.findOne({ email });
    if (!contactUser) return res.status(404).json({ msg: "User not found" });

    if (contactUser._id.toString() === currentUserId)
      return res.status(400).json({ msg: "Cannot add yourself as contact" });

    const currentUser = await User.findById(currentUserId);

    if (currentUser.contacts.includes(contactUser._id)) {
      return res.status(400).json({ msg: "Already in contacts" });
    }

    currentUser.contacts.push(contactUser._id);
    await currentUser.save();

    if (!contactUser.contacts.includes(currentUser._id)) {
      contactUser.contacts.push(currentUser._id);
      await contactUser.save();
    }

    res.json({ msg: "Contact added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
