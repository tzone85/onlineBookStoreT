const {
  validateBookCreate,
  validateBookUpdate,
  validateIsbnParam,
} = require("../middleware/validate");
const Book = require("../models/Book");

// Mock the Book model
jest.mock("../models/Book");

describe("Book Validation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("validateBookCreate", () => {
    test("should pass validation with valid book data", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      };

      Book.findOne.mockResolvedValue(null); // No existing book

      await validateBookCreate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body).toEqual({
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      });
    });

    test("should fail validation when ISBN is missing", async () => {
      req.body = {
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      };

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["ISBN is required and must be a non-empty string"],
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should fail validation when title is empty", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      };

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Title is required and must be a non-empty string"],
      });
    });

    test("should fail validation when price is negative", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: -5.99,
        stockQuantity: 5,
      };

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Price must be a positive number"],
      });
    });

    test("should fail validation when stockQuantity is negative", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: -1,
      };

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Stock quantity must be a non-negative number"],
      });
    });

    test("should fail validation when ISBN already exists", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      };

      Book.findOne.mockResolvedValue({ isbn: "978-0123456789" }); // Existing book

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["A book with this ISBN already exists"],
      });
    });

    test("should handle multiple validation errors", async () => {
      req.body = {
        isbn: "",
        title: "",
        price: "invalid",
        stockQuantity: -1,
      };

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: [
          "ISBN is required and must be a non-empty string",
          "Title is required and must be a non-empty string",
          "Author is required and must be a non-empty string",
          "Price must be a positive number",
          "Stock quantity must be a non-negative number",
        ],
      });
    });

    test("should trim whitespace from string fields", async () => {
      req.body = {
        isbn: "  978-0123456789  ",
        title: "  Test Book  ",
        author: "  Test Author  ",
        price: 19.99,
        stockQuantity: 5,
      };

      Book.findOne.mockResolvedValue(null);

      await validateBookCreate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      });
    });
  });

  describe("validateBookUpdate", () => {
    beforeEach(() => {
      req.params.isbn = "978-0123456789";
    });

    test("should pass validation with valid partial update", async () => {
      req.body = {
        title: "Updated Title",
        price: 29.99,
      };

      Book.findOne.mockResolvedValue(null);

      await validateBookUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({
        title: "Updated Title",
        price: 29.99,
      });
    });

    test("should fail validation when no fields are provided", async () => {
      req.body = {};

      await validateBookUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["At least one field must be provided for update"],
      });
    });

    test("should fail validation when updating to an existing ISBN", async () => {
      req.body = {
        isbn: "978-9876543210",
      };

      Book.findOne.mockResolvedValue({
        isbn: "978-9876543210",
      }); // Different existing book

      await validateBookUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["A book with this ISBN already exists"],
      });
    });

    test("should pass validation when updating ISBN to same value", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Updated Title",
      };

      Book.findOne.mockResolvedValue({
        isbn: "978-0123456789",
      }); // Same book

      await validateBookUpdate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({
        isbn: "978-0123456789",
        title: "Updated Title",
      });
    });

    test("should fail validation with invalid price in update", async () => {
      req.body = {
        price: -10.99,
      };

      await validateBookUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: ["Price must be a positive number"],
      });
    });
  });

  describe("validateIsbnParam", () => {
    test("should pass validation with valid ISBN parameter", () => {
      req.params.isbn = "978-0123456789";

      validateIsbnParam(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(req.params.isbn).toBe("978-0123456789");
    });

    test("should fail validation when ISBN parameter is missing", () => {
      req.params.isbn = "";

      validateIsbnParam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Valid ISBN parameter is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should trim whitespace from ISBN parameter", () => {
      req.params.isbn = "  978-0123456789  ";

      validateIsbnParam(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.params.isbn).toBe("978-0123456789");
    });
  });

  describe("Error handling", () => {
    test("should handle database errors in validateBookCreate", async () => {
      req.body = {
        isbn: "978-0123456789",
        title: "Test Book",
        author: "Test Author",
        price: 19.99,
        stockQuantity: 5,
      };

      Book.findOne.mockRejectedValue(new Error("Database connection failed"));

      await validateBookCreate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error during validation",
        error: "Database connection failed",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should handle database errors in validateBookUpdate", async () => {
      req.body = {
        isbn: "978-9876543210",
        title: "Updated Title",
      };
      req.params.isbn = "978-0123456789";

      Book.findOne.mockRejectedValue(new Error("Database connection failed"));

      await validateBookUpdate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Server error during validation",
        error: "Database connection failed",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
