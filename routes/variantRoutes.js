const express = require("express");
const router = express.Router();
const variantController = require("../controllers/variantController");

// ✅ Variant CRUD
router.post("/:productId", variantController.addVariant);
router.put("/:productId/:variantId", variantController.updateVariant);
router.delete("/:productId/:variantId", variantController.deleteVariant);
router.get("/:productId/:variantId", variantController.getVariantById);

module.exports = router;
