const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getUserProfile,
  getAllUsers,
  todayLogins,
  changePassword,
  updateUserDetails
} = require("../controllers/authController");
const isAuthenticated = require("../middleware/authMiddleware");



const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout",isAuthenticated, logoutUser);
router.get("/profile",  getUserProfile);
router.put("/update",  updateUser);
router.delete("/delete",  deleteUser);
router.get("/all",  getAllUsers);
router.get("/todayLogins",  todayLogins); 
router.put("/changePassword",isAuthenticated,  changePassword);
router.put("/updateDetails",isAuthenticated,  updateUserDetails);

module.exports = router;
