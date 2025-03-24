const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const isAuthenticated = require("../middleware/authMiddleware");

// ✅ Add item to cart
router.post("/add",isAuthenticated, cartController.addToCart);

// ✅ Remove item from cart
router.post("/remove",isAuthenticated, cartController.removeFromCart);

// ✅ Update item quantity in cart
router.post("/update",isAuthenticated, cartController.updateCartItemQuantity);

// ✅ Get user's cart
router.get("/",isAuthenticated, cartController.getCart);

module.exports = router;
