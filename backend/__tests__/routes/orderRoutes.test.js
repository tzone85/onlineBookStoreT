/**
 * Integration tests for order routes with approval mode functionality
 */

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Book = require("../../models/Book");
const orderRoutes = require("../../routes/orderRoutes");

// Mock the approval mode for controlled testing
jest.mock("../../utils/approvalMode", () => ({
  validateOrder: jest.fn(),
  processOrder: jest.fn(),
  isApprovalMode: jest.fn(),
}));

const mockApprovalMode = require("../../utils/approvalMode");

// Create Express app for testing
const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);

// Mock mongoose models
jest.mock("../../models/Order");
jest.mock("../../models/Book");

describe("Order Routes Integration with Approval Mode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/orders", () => {
    const createMockBook = (overrides = {}) => ({
      isbn: "978-0123456789",
      title: "Test Book",
      price: 19.99,
      stockQuantity: 10,
      save: jest.fn(),
      ...overrides,
    });

    const validOrderRequest = {
      isbn: "978-0123456789",
      quantity: 2,
    };

    describe("With Approval Mode Enabled", () => {
      beforeEach(() => {
        mockApprovalMode.isApprovalMode.mockReturnValue(true);
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockApprovalMode.processOrder.mockImplementation((data) => ({
          ...data,
          status: "pending",
        }));
      });

      test("should create order with pending status when approval mode is enabled", async () => {
        Book.findOne.mockResolvedValue(createMockBook());

        const mockOrder = {
          _id: "order123",
          isbn: "978-0123456789",
          quantity: 2,
          totalPrice: 39.98,
          status: "pending",
          save: jest.fn().mockResolvedValue({
            _id: "order123",
            isbn: "978-0123456789",
            quantity: 2,
            totalPrice: 39.98,
            status: "pending",
          }),
        };
        Order.mockImplementation(() => mockOrder);

        const response = await request(app)
          .post("/api/orders")
          .send(validOrderRequest);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("pending");
        expect(mockApprovalMode.validateOrder).toHaveBeenCalledWith({
          isbn: "978-0123456789",
          quantity: 2,
          totalPrice: 39.98,
        });
        expect(mockApprovalMode.processOrder).toHaveBeenCalled();
      });

      test("should validate order data before processing", async () => {
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: false,
          errors: ["ISBN is required", "Valid quantity is required"],
        });

        Book.findOne.mockResolvedValue(createMockBook());

        const response = await request(app)
          .post("/api/orders")
          .send(validOrderRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Order validation failed");
        expect(response.body.errors).toContain("ISBN is required");
        expect(response.body.errors).toContain("Valid quantity is required");
      });

      test("should update book stock after successful order creation", async () => {
        const mockBook = createMockBook();
        Book.findOne.mockResolvedValue(mockBook);

        const mockOrder = {
          isbn: "978-0123456789",
          quantity: 2,
          totalPrice: 39.98,
          status: "pending",
          save: jest.fn().mockResolvedValue({
            _id: "order123",
            isbn: "978-0123456789",
            quantity: 2,
            totalPrice: 39.98,
            status: "pending",
          }),
        };
        Order.mockImplementation(() => mockOrder);

        await request(app).post("/api/orders").send(validOrderRequest);

        expect(mockBook.stockQuantity).toBe(8); // 10 - 2
        expect(mockBook.save).toHaveBeenCalled();
      });
    });

    describe("With Approval Mode Disabled", () => {
      beforeEach(() => {
        mockApprovalMode.isApprovalMode.mockReturnValue(false);
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockApprovalMode.processOrder.mockImplementation((data) => ({
          ...data,
          status: "completed",
        }));
      });

      test("should create order with completed status when approval mode is disabled", async () => {
        Book.findOne.mockResolvedValue(createMockBook());

        const mockOrder = {
          isbn: "978-0123456789",
          quantity: 1,
          totalPrice: 19.99,
          status: "completed",
          save: jest.fn().mockResolvedValue({
            _id: "order456",
            isbn: "978-0123456789",
            quantity: 1,
            totalPrice: 19.99,
            status: "completed",
          }),
        };
        Order.mockImplementation(() => mockOrder);

        const response = await request(app)
          .post("/api/orders")
          .send({ isbn: "978-0123456789", quantity: 1 });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe("completed");
        expect(mockApprovalMode.processOrder).toHaveBeenCalled();
      });
    });

    describe("Error Handling", () => {
      test("should return 404 when book is not found", async () => {
        Book.findOne.mockResolvedValue(null);

        const response = await request(app)
          .post("/api/orders")
          .send(validOrderRequest);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Book not found");
        expect(mockApprovalMode.validateOrder).not.toHaveBeenCalled();
      });

      test("should return 400 when insufficient stock", async () => {
        const lowStockBook = { ...createMockBook(), stockQuantity: 1 };
        Book.findOne.mockResolvedValue(lowStockBook);

        const response = await request(app)
          .post("/api/orders")
          .send({ isbn: "978-0123456789", quantity: 5 });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Insufficient stock");
        expect(mockApprovalMode.validateOrder).not.toHaveBeenCalled();
      });

      test("should handle approval mode processing errors", async () => {
        Book.findOne.mockResolvedValue(createMockBook());
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockApprovalMode.processOrder.mockImplementation(() => {
          throw new Error("Processing failed");
        });

        const response = await request(app)
          .post("/api/orders")
          .send(validOrderRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Processing failed");
      });

      test("should handle database save errors", async () => {
        Book.findOne.mockResolvedValue(createMockBook());
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockApprovalMode.processOrder.mockImplementation((data) => data);

        const mockOrder = {
          save: jest.fn().mockRejectedValue(new Error("Database error")),
        };
        Order.mockImplementation(() => mockOrder);

        const response = await request(app)
          .post("/api/orders")
          .send(validOrderRequest);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Database error");
      });
    });

    describe("Edge Cases", () => {
      beforeEach(() => {
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: true,
          errors: [],
        });
        mockApprovalMode.processOrder.mockImplementation((data) => ({
          ...data,
          status: "pending",
        }));
      });

      test("should handle zero quantity validation through approval mode", async () => {
        Book.findOne.mockResolvedValue(createMockBook());
        mockApprovalMode.validateOrder.mockReturnValue({
          valid: false,
          errors: ["Valid quantity is required"],
        });

        const response = await request(app)
          .post("/api/orders")
          .send({ isbn: "978-0123456789", quantity: 0 });

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain("Valid quantity is required");
      });

      test("should handle large quantities", async () => {
        const highStockBook = { ...createMockBook(), stockQuantity: 1000 };
        Book.findOne.mockResolvedValue(highStockBook);

        const mockOrder = {
          save: jest.fn().mockResolvedValue({
            _id: "order789",
            isbn: "978-0123456789",
            quantity: 500,
            totalPrice: 9995,
            status: "pending",
          }),
        };
        Order.mockImplementation(() => mockOrder);

        const response = await request(app)
          .post("/api/orders")
          .send({ isbn: "978-0123456789", quantity: 500 });

        expect(response.status).toBe(201);
        expect(response.body.quantity).toBe(500);
        expect(mockApprovalMode.validateOrder).toHaveBeenCalledWith({
          isbn: "978-0123456789",
          quantity: 500,
          totalPrice: 9995,
        });
      });

      test("should calculate total price correctly", async () => {
        const expensiveBook = { ...createMockBook(), price: 100.0 };
        Book.findOne.mockResolvedValue(expensiveBook);

        await request(app)
          .post("/api/orders")
          .send({ isbn: "978-0123456789", quantity: 3 });

        expect(mockApprovalMode.validateOrder).toHaveBeenCalledWith({
          isbn: "978-0123456789",
          quantity: 3,
          totalPrice: 300,
        });
      });
    });
  });

  describe("GET /api/orders", () => {
    test("should return all orders sorted by creation date", async () => {
      const mockOrders = [
        {
          _id: "1",
          isbn: "978-1",
          status: "completed",
          createdAt: "2023-01-02T00:00:00.000Z",
        },
        {
          _id: "2",
          isbn: "978-2",
          status: "pending",
          createdAt: "2023-01-01T00:00:00.000Z",
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
      };
      mockQuery.sort.mockResolvedValue(mockOrders);
      Order.find.mockReturnValue(mockQuery);

      const response = await request(app).get("/api/orders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test("should handle database errors in GET", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
      };
      mockQuery.sort.mockRejectedValue(new Error("Database connection failed"));
      Order.find.mockReturnValue(mockQuery);

      const response = await request(app).get("/api/orders");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Database connection failed");
    });
  });
});
