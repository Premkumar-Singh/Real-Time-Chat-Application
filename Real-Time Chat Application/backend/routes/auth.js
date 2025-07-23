const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const nameRegex = /^[A-Za-z][A-Za-z\s]*$/;
const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).json({ msg: "All fields are required" });

  if (!nameRegex.test(name))
    return res.status(400).json({
      msg: "Name must start with a letter and contain only letters and spaces",
    });
 
  if (!emailRegex.test(email))
    return res.status(400).json({ msg: "Invalid email format. (Inter in this format xyz@gmail.com and email not start with number.)" });

  if (!passwordRegex.test(password))
    return res.status(400).json({
      msg:
        "Password must be at least 8 characters long, contain at least one uppercase letter and one special character",
    });

  if (password !== confirmPassword)
    return res.status(400).json({ msg: "Passwords do not match" });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ msg: "User already exists" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.json({ msg: "Registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error, please try again later." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

  const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1h"
  });

  res.json({ token });
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ name: user.name, email: user.email , id: user._id});
});

module.exports = router;
