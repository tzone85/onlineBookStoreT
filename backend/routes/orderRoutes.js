const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Book = require("../models/Book");
const { getOrderBehavior } = require("../../lib/approval-mode");

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.body.isbn });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stockQuantity < req.body.quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Get approval mode behavior
    const behavior = getOrderBehavior(global.APPROVAL_MODE);

    const order = new Order({
      isbn: req.body.isbn,
      quantity: req.body.quantity,
      totalPrice: book.price * req.body.quantity,
      status: behavior.initialStatus,
    });

    const newOrder = await order.save();

    // Update book stock based on approval mode
    if (behavior.updateStock) {
      book.stockQuantity -= req.body.quantity;
      await book.save();
    }

    const response = {
      success: true,
      data: newOrder,
    };

    // Add approval information for manual/strict modes
    if (behavior.requiresApproval) {
      response.message = "Order created and pending approval";
      response.data.requiresApproval = true;
    }

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve an order (for manual/strict approval modes)
router.put("/:id/approve", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Order is already ${order.status}` });
    }

    const book = await Book.findOne({ isbn: order.isbn });
    if (!book) {
      return res.status(404).json({ message: "Book not found for this order" });
    }

    if (book.stockQuantity < order.quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient stock to approve order" });
    }

    // Update order status and reduce stock
    order.status = "completed";
    book.stockQuantity -= order.quantity;

    await order.save();
    await book.save();

    res.json({
      success: true,
      message: "Order approved successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reject an order (for manual/strict approval modes)
router.put("/:id/reject", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Order is already ${order.status}` });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order rejected successfully",
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
