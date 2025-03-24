const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, role, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const profilePhoto = `https://avatar.iran.liara.run/public/boy?email=${email}`;

    const newUser = await User.create({ firstName, lastName, mobileNumber, role, email, password: hashedPassword, profilePhoto });

    res.status(201).json({ message: "User Registered Successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials", success: false });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Generated Token:", token); // Debugging log

    // ✅ Secure cookies me store karna
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.cookie("role", user.role, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    console.log("Cookies Set:", { token, role: user.role }); // Debugging log

    res.status(200).json({
      message: "Login Successful",
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error in loginUser:", error); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

// Logout User
exports.logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.cookie("role", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: "Logout Successful", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id,role } = req.body;
    console.log(id,role);
    
    const userId = id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // if (email && email !== user.email) {
    //   const emailExists = await User.findOne({ email });
    //   if (emailExists) return res.status(400).json({ message: "Email already in use" });
    //   user.email = email;
    // }

    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   user.password = await bcrypt.hash(password, salt);
    // }

    // user.firstName = firstName || user.firstName;
    // user.lastName = lastName || user.lastName;
    // user.mobileNumber = mobileNumber || user.mobileNumber;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userId  = req.body.id
console.log(userId);

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get All Users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    // Ensure only admin users can access this
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied. Admins only!" });
    // }

    const users = await User.find().select("-password"); // Exclude passwords
    res.status(200).json({ users, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.todayLogins = async (req, res) => {
  try {
    // Ensure only admin users can access this
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied. Admins only!" });
    // }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await User.find({ lastLogin: { $gte: today } }).select("-password"); // Exclude passwords
    res.status(200).json({ users, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const id = req.id;
    console.log(id ,"id");
    
    const { newPassword, oldPassword } = req.body;
    console.log(req.body, "req.body");
    const currentPassword = oldPassword;
    const password = newPassword;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare the provided current password with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const id = req.id;
    const { email,  firstName, lastName, mobileNumber, role  } = req.body;
    console.log(id,role);
    
    const userId = id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.mobileNumber = mobileNumber || user.mobileNumber;
    user.email = email || user.email;
    // user.role = role || user.role;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};