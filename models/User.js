import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Faculty", "HOD", "Principal", "Director", "Admin"],
      default: "Faculty",
    },
    department: {
      type: String,
      required: function () {
        return (
          this.role !== "Admin" &&
          this.role !== "Principal" &&
          this.role !== "Director"
        );
      },
    },
    designation: {
      type: String,
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    phone: {
      type: String,
    },
    profilePhoto: {
      type: String, // URL
    },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
