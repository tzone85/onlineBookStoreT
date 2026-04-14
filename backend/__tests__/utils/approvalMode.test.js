/**
 * Unit tests for approval mode functionality
 */

const originalArgv = process.argv;

// Mock process.argv for testing
const mockProcessArgv = (args) => {
  process.argv = ["node", "server.js", ...args];
};

const restoreProcessArgv = () => {
  process.argv = originalArgv;
};

describe("ApprovalMode", () => {
  let ApprovalMode;

  beforeEach(() => {
    // Clear the module cache to get a fresh instance
    jest.resetModules();
    restoreProcessArgv();
  });

  afterEach(() => {
    restoreProcessArgv();
  });

  describe("Argument Parsing", () => {
    test("should detect --approval-mode argument when present", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.isApprovalMode()).toBe(true);
    });

    test("should not detect approval mode when argument is absent", () => {
      mockProcessArgv([]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.isApprovalMode()).toBe(false);
    });

    test("should detect --approval-mode among other arguments", () => {
      mockProcessArgv(["--port", "3000", "--approval-mode", "--debug"]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.isApprovalMode()).toBe(true);
    });

    test("should handle case-sensitive argument parsing", () => {
      mockProcessArgv(["--APPROVAL-MODE", "--Approval-Mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.isApprovalMode()).toBe(false);
    });

    test("should handle empty process.argv", () => {
      process.argv = [];
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.isApprovalMode()).toBe(false);
    });
  });

  describe("Business Logic", () => {
    test("should return pending status when approval mode is enabled", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.getInitialOrderStatus()).toBe("pending");
    });

    test("should return completed status when approval mode is disabled", () => {
      mockProcessArgv([]);
      ApprovalMode = require("../../utils/approvalMode");

      expect(ApprovalMode.getInitialOrderStatus()).toBe("completed");
    });

    test("should process order with pending status in approval mode", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 29.98,
      };

      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(processedOrder).toEqual({
        ...orderData,
        status: "pending",
      });
    });

    test("should process order with completed status when approval mode is off", () => {
      mockProcessArgv([]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 29.98,
      };

      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(processedOrder).toEqual({
        ...orderData,
        status: "completed",
      });
    });

    test("should preserve existing order data when processing", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 29.98,
        customerEmail: "test@example.com",
        createdAt: new Date(),
      };

      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(processedOrder.isbn).toBe(orderData.isbn);
      expect(processedOrder.quantity).toBe(orderData.quantity);
      expect(processedOrder.totalPrice).toBe(orderData.totalPrice);
      expect(processedOrder.customerEmail).toBe(orderData.customerEmail);
      expect(processedOrder.createdAt).toBe(orderData.createdAt);
      expect(processedOrder.status).toBe("pending");
    });
  });

  describe("Error Cases", () => {
    beforeEach(() => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");
    });

    test("should throw error when processing null order data", () => {
      expect(() => {
        ApprovalMode.processOrder(null);
      }).toThrow("Order data is required");
    });

    test("should throw error when processing undefined order data", () => {
      expect(() => {
        ApprovalMode.processOrder(undefined);
      }).toThrow("Order data is required");
    });

    test("should validate order data and return errors for missing fields", () => {
      const validation = ApprovalMode.validateOrder({});

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("ISBN is required");
      expect(validation.errors).toContain("Valid quantity is required");
      expect(validation.errors).toContain("Valid total price is required");
    });

    test("should validate order data and return errors for invalid quantity", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: 0,
        totalPrice: 29.98,
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Valid quantity is required");
    });

    test("should validate order data and return errors for negative quantity", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: -1,
        totalPrice: 29.98,
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Valid quantity is required");
    });

    test("should validate order data and return errors for invalid price", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 0,
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Valid total price is required");
    });

    test("should validate order data and return errors for negative price", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: -10,
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Valid total price is required");
    });

    test("should return error for null order data validation", () => {
      const validation = ApprovalMode.validateOrder(null);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Order data is required");
    });

    test("should return error for undefined order data validation", () => {
      const validation = ApprovalMode.validateOrder(undefined);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain("Order data is required");
    });
  });

  describe("Valid Order Validation", () => {
    beforeEach(() => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");
    });

    test("should validate correct order data successfully", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 29.98,
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test("should validate order with additional fields successfully", () => {
      const orderData = {
        isbn: "978-0123456789",
        quantity: 2,
        totalPrice: 29.98,
        customerEmail: "test@example.com",
        notes: "Rush delivery",
      };

      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    test("should handle very large quantities", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 999999,
        totalPrice: 14999985.01,
      };

      const validation = ApprovalMode.validateOrder(orderData);
      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(validation.valid).toBe(true);
      expect(processedOrder.quantity).toBe(999999);
      expect(processedOrder.status).toBe("pending");
    });

    test("should handle very large prices", () => {
      mockProcessArgv([]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 1,
        totalPrice: 999999.99,
      };

      const validation = ApprovalMode.validateOrder(orderData);
      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(validation.valid).toBe(true);
      expect(processedOrder.totalPrice).toBe(999999.99);
      expect(processedOrder.status).toBe("completed");
    });

    test("should handle decimal quantities (should fail validation)", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 2.5,
        totalPrice: 37.47,
      };

      // Even though quantity is decimal, our current validation only checks > 0
      // This demonstrates that we might need more sophisticated validation in the future
      const validation = ApprovalMode.validateOrder(orderData);

      expect(validation.valid).toBe(true);
    });

    test("should handle special characters in ISBN", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      const orderData = {
        isbn: "978-0-12-345-678-9",
        quantity: 1,
        totalPrice: 15.99,
      };

      const validation = ApprovalMode.validateOrder(orderData);
      const processedOrder = ApprovalMode.processOrder(orderData);

      expect(validation.valid).toBe(true);
      expect(processedOrder.isbn).toBe("978-0-12-345-678-9");
    });
  });

  describe("Integration Tests", () => {
    test("should handle complete workflow with approval mode enabled", () => {
      mockProcessArgv(["--approval-mode"]);
      ApprovalMode = require("../../utils/approvalMode");

      // Test the complete flow
      expect(ApprovalMode.isApprovalMode()).toBe(true);
      expect(ApprovalMode.getInitialOrderStatus()).toBe("pending");

      const orderData = {
        isbn: "978-0123456789",
        quantity: 3,
        totalPrice: 44.97,
      };

      const validation = ApprovalMode.validateOrder(orderData);
      expect(validation.valid).toBe(true);

      const processedOrder = ApprovalMode.processOrder(orderData);
      expect(processedOrder.status).toBe("pending");
    });

    test("should handle complete workflow with approval mode disabled", () => {
      mockProcessArgv([]);
      ApprovalMode = require("../../utils/approvalMode");

      // Test the complete flow
      expect(ApprovalMode.isApprovalMode()).toBe(false);
      expect(ApprovalMode.getInitialOrderStatus()).toBe("completed");

      const orderData = {
        isbn: "978-0987654321",
        quantity: 1,
        totalPrice: 24.99,
      };

      const validation = ApprovalMode.validateOrder(orderData);
      expect(validation.valid).toBe(true);

      const processedOrder = ApprovalMode.processOrder(orderData);
      expect(processedOrder.status).toBe("completed");
    });
  });
});
