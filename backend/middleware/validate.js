const Book = require("../models/Book");

/**
 * Validates book data for POST operations (creating new books)
 */
const validateBookCreate = async (req, res, next) => {
  try {
    const { isbn, title, author, price, stockQuantity } = req.body;
    const errors = [];

    // Validate required fields
    if (!isbn || typeof isbn !== "string" || isbn.trim() === "") {
      errors.push("ISBN is required and must be a non-empty string");
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.push("Title is required and must be a non-empty string");
    }

    if (!author || typeof author !== "string" || author.trim() === "") {
      errors.push("Author is required and must be a non-empty string");
    }

    if (price === undefined || price === null) {
      errors.push("Price is required");
    } else if (typeof price !== "number" || isNaN(price) || price <= 0) {
      errors.push("Price must be a positive number");
    }

    if (stockQuantity === undefined || stockQuantity === null) {
      errors.push("Stock quantity is required");
    } else if (
      typeof stockQuantity !== "number" ||
      isNaN(stockQuantity) ||
      stockQuantity < 0
    ) {
      errors.push("Stock quantity must be a non-negative number");
    }

    // Check for duplicate ISBN
    if (isbn && typeof isbn === "string") {
      const existingBook = await Book.findOne({ isbn: isbn.trim() });
      if (existingBook) {
        errors.push("A book with this ISBN already exists");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Sanitize input data
    req.body = {
      isbn: isbn.trim(),
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during validation",
      error: error.message,
    });
  }
};

/**
 * Validates book data for PUT operations (updating existing books)
 */
const validateBookUpdate = async (req, res, next) => {
  try {
    const { isbn, title, author, price, stockQuantity } = req.body;
    const errors = [];
    const updateData = {};

    // Check if at least one field is provided
    const providedFields = [isbn, title, author, price, stockQuantity];
    const hasAnyField = providedFields.some((field) => field !== undefined);

    if (!hasAnyField) {
      errors.push("At least one field must be provided for update");
    }

    // Validate optional fields (for updates, fields are optional)
    if (isbn !== undefined) {
      if (typeof isbn !== "string" || isbn.trim() === "") {
        errors.push("ISBN must be a non-empty string");
      } else {
        // Check for duplicate ISBN (excluding current book)
        const existingBook = await Book.findOne({ isbn: isbn.trim() });
        if (existingBook && existingBook.isbn !== req.params.isbn) {
          errors.push("A book with this ISBN already exists");
        }
        updateData.isbn = isbn.trim();
      }
    }

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        errors.push("Title must be a non-empty string");
      } else {
        updateData.title = title.trim();
      }
    }

    if (author !== undefined) {
      if (typeof author !== "string" || author.trim() === "") {
        errors.push("Author must be a non-empty string");
      } else {
        updateData.author = author.trim();
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number" || isNaN(price) || price <= 0) {
        errors.push("Price must be a positive number");
      } else {
        updateData.price = Number(price);
      }
    }

    if (stockQuantity !== undefined) {
      if (
        typeof stockQuantity !== "number" ||
        isNaN(stockQuantity) ||
        stockQuantity < 0
      ) {
        errors.push("Stock quantity must be a non-negative number");
      } else {
        updateData.stockQuantity = Number(stockQuantity);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    // Set sanitized update data
    req.body = updateData;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during validation",
      error: error.message,
    });
  }
};

/**
 * Validates ISBN parameter for GET/DELETE operations
 */
const validateIsbnParam = (req, res, next) => {
  const { isbn } = req.params;

  if (!isbn || typeof isbn !== "string" || isbn.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Valid ISBN parameter is required",
    });
  }

  // Sanitize the ISBN parameter
  req.params.isbn = isbn.trim();
  next();
};

module.exports = {
  validateBookCreate,
  validateBookUpdate,
  validateIsbnParam,
};
