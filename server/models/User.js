// Path: backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing

const UserSchema = mongoose.Schema({
  // User's name, required field
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  // User's email, required and must be unique
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    // Basic email format validation using a regular expression
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email address",
    ],
  },
  // User's password, required
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6, // Minimum password length
  },
  // Timestamp for when the user was created
  // Role (used for role-based access control)
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash the password before saving the user
UserSchema.pre("save", async function (next) {
  // Only hash if the password field is modified or is new
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a salt with 10 rounds
  const salt = await bcrypt.genSalt(10);
  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in the database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema); // Export the User model
