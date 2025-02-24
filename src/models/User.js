const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required:true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    scores: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 }
    }

  }
  
);

const User = mongoose.model("User", userSchema);

module.exports = User;
