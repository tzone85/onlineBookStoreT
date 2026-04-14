const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Book = require("../models/Book");
const approvalMode = require("../utils/approvalMode");

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

    // Prepare order data for validation and processing
    const orderData = {
      isbn: req.body.isbn,
      quantity: req.body.quantity,
      totalPrice: book.price * req.body.quantity,
    };

    // Validate order data using approval mode validation
    const validation = approvalMode.validateOrder(orderData);
    if (!validation.valid) {
      return res.status(400).json({
        message: "Order validation failed",
        errors: validation.errors,
      });
    }

    // Process order data with approval mode to set correct status
    const processedOrderData = approvalMode.processOrder(orderData);

    const order = new Order(processedOrderData);
    const newOrder = await order.save();

    // Update book stock
    book.stockQuantity -= req.body.quantity;
    await book.save();

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
