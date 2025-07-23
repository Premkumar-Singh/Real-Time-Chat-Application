const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // optional
  joinId: { type: String, unique: true }  // ✅ required for sharing group
});

module.exports = mongoose.model("Group", GroupSchema);
