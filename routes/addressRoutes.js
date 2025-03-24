const express = require("express");
const router = express.Router();
const {
    addAddress,
    setDefaultAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
} = require("../controllers/addressController");

const isAuthenticated = require("../middleware/authMiddleware"); // ✅ Fix import

router.use(isAuthenticated); // ✅ Now correctly imported

// ✅ Add Address
router.post("/add", addAddress);

// ✅ Set Default Address
router.put("/set-default", setDefaultAddress);

// ✅ Get all Addresses for a user
router.get("/", getUserAddresses);

// ✅ Get Address by ID
router.get("/:userId", getAddressById);

// ✅ Update Address
router.put("/update/:addressId", updateAddress);

// ✅ Delete Address
router.delete("/delete/:addressId", deleteAddress);

module.exports = router;
