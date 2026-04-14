const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const {
  validateBookCreate,
  validateBookUpdate,
  validateIsbnParam,
} = require("../middleware/validate");

// Get books with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find().skip(skip).limit(limit).sort({ title: 1 });

    const total = await Book.countDocuments();

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new book
router.post("/", validateBookCreate, async (req, res) => {
  const book = new Book({
    isbn: req.body.isbn,
    title: req.body.title,
    author: req.body.author,
    price: req.body.price,
    stockQuantity: req.body.stockQuantity,
  });

  try {
    const newBook = await book.save();
    res.status(201).json({
      success: true,
      data: newBook,
      message: "Book created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
});

// Get book by ISBN
router.get("/:isbn", validateIsbnParam, async (req, res) => {
  try {
    const book = await Book.findOne({ isbn: req.params.isbn });
    if (book) {
      res.json({
        success: true,
        data: book,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// Update book by ISBN
router.put(
  "/:isbn",
  validateIsbnParam,
  validateBookUpdate,
  async (req, res) => {
    try {
      const updatedBook = await Book.findOneAndUpdate(
        { isbn: req.params.isbn },
        req.body,
        { new: true, runValidators: true },
      );

      if (!updatedBook) {
        return res.status(404).json({
          success: false,
          message: "Book not found",
        });
      }

      res.json({
        success: true,
        data: updatedBook,
        message: "Book updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to update book",
        error: error.message,
      });
    }
  },
);

module.exports = router;
