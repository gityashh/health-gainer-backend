const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");

// ✅ Place Order
exports.placeOrder = async (req, res) => {
  const id = req.id;
  const userId = id;
  try {
    const { addressId, paymentMethod } = req.body;

    // Fetch the user's cart and populate product and variant details
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: "Product"
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty!" });
    }

    // Fetch the address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Calculate the total amount based on variant prices
    let totalAmount = cart.items.reduce((acc, item) => {
      const product = item.productId;
      const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());

      if (!variant) {
        throw new Error(`Variant not found for product: ${product.name}`);
      }

      // Use variant price if available, otherwise use product price
      const price = variant.price || product.price;
      return acc + item.quantity * price;
    }, 0);

    // Create the order
    const order = new Order({
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.productId.variants.find((v) => v._id.toString() === item.variantId.toString())?.price || item.productId.price
      })),
      totalAmount,
      address: addressId,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid"
    });

    await order.save();

    // Empty the cart after placing the order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ success: true, message: "Order placed successfully!", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Orders for a User
exports.getOrders = async (req, res) => {
  const id = req.id;
  const userId = id;
  try {
    // const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("address") // Address details populate karein
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("address") // Address details populate karein
      .populate("items.productId"); // Product details populate karein
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.status(200).json({ success: true, message: "Order status updated successfully!", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, message: "Order deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("address").populate({
      path: "items.productId",
      populate: {
        path: "variants",
        model: "Product",
      },
    }).populate("userId");
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = status;
    order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({ success: true, message: "Order updated successfully!", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.totalRevenu = async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    if (totalRevenue.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, totalRevenue: totalRevenue[0].total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.monthlyRevenu = async (req, res) => {
  try {
    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({ success: true, monthlyRevenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.orderTrack = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

