const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/authMiddleware");
const { 
    placeOrder, 
    getOrders, 
    updateOrderStatus, 
    getAllOrders, 
    totalRevenu ,
    monthlyRevenu
} = require("../controllers/orderController");

// ✅ Place Order
router.post("/place",isAuthenticated, placeOrder);

// ✅ Get All Orders (Admin)
router.get("/all",isAuthenticated, getAllOrders);

// ✅ Get Total Revenue (Admin)
router.get("/revenu",isAuthenticated, totalRevenu);

// ✅ Get Orders for User (यह रूट सबसे अंत में होना चाहिए)
router.get("/",isAuthenticated, getOrders);

// ✅ Update Order Status (Admin)
router.put("/update",isAuthenticated, updateOrderStatus);

// ✅ Get Monthly Revenue (Admin)
router.get("/monthly-revenu",isAuthenticated, monthlyRevenu);

module.exports = router;
