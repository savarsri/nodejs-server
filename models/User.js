const mongoose = require("mongoose");
const Schema = mongoose.Schema;
import validator from 'validator'


// User Schema defined

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      immutable: true,
      unique: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please Provide Email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
    },
    teams: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Team",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
