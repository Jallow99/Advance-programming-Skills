// Path: server/scripts/makeAdmin.js
// Usage: npm run make-admin -- someone@example.com
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: npm run make-admin -- user@email.com");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  console.log(user ? `${user.email} is now an admin` : "No user with that email");
  await mongoose.disconnect();
})();
