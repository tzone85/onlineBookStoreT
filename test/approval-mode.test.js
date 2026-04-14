const {
  APPROVAL_MODES,
  DEFAULT_MODE,
  parseApprovalMode,
  getOrderBehavior,
  validateModeInteractions,
} = require("../lib/approval-mode");

describe("Approval Mode", () => {
  let originalArgv;

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("parseApprovalMode", () => {
    test("should return default mode when no argument provided", () => {
      process.argv = ["node", "server.js"];
      expect(parseApprovalMode()).toBe(DEFAULT_MODE);
    });

    test("should parse auto mode correctly", () => {
      process.argv = ["node", "server.js", "--approval-mode", "auto"];
      expect(parseApprovalMode()).toBe(APPROVAL_MODES.AUTO);
    });

    test("should parse manual mode correctly", () => {
      process.argv = ["node", "server.js", "--approval-mode", "manual"];
      expect(parseApprovalMode()).toBe(APPROVAL_MODES.MANUAL);
    });

    test("should parse strict mode correctly", () => {
      process.argv = ["node", "server.js", "--approval-mode", "strict"];
      expect(parseApprovalMode()).toBe(APPROVAL_MODES.STRICT);
    });

    test("should throw error for invalid mode", () => {
      process.argv = ["node", "server.js", "--approval-mode", "invalid"];
      expect(() => parseApprovalMode()).toThrow(
        "Invalid approval mode: invalid. Valid options: auto, manual, strict",
      );
    });

    test("should throw error when --approval-mode has no value", () => {
      process.argv = ["node", "server.js", "--approval-mode"];
      expect(() => parseApprovalMode()).toThrow(
        "--approval-mode requires a value",
      );
    });
  });

  describe("getOrderBehavior", () => {
    test("should return auto behavior", () => {
      const behavior = getOrderBehavior(APPROVAL_MODES.AUTO);
      expect(behavior).toEqual({
        autoComplete: true,
        requiresApproval: false,
        updateStock: true,
        initialStatus: "completed",
      });
    });

    test("should return manual behavior", () => {
      const behavior = getOrderBehavior(APPROVAL_MODES.MANUAL);
      expect(behavior).toEqual({
        autoComplete: false,
        requiresApproval: true,
        updateStock: false,
        initialStatus: "pending",
      });
    });

    test("should return strict behavior", () => {
      const behavior = getOrderBehavior(APPROVAL_MODES.STRICT);
      expect(behavior).toEqual({
        autoComplete: false,
        requiresApproval: true,
        updateStock: false,
        initialStatus: "pending",
        requireAdminApproval: true,
      });
    });

    test("should use default mode when no mode provided", () => {
      const behavior = getOrderBehavior();
      expect(behavior.initialStatus).toBe("completed");
    });

    test("should throw error for unknown mode", () => {
      expect(() => getOrderBehavior("unknown")).toThrow(
        "Unknown approval mode: unknown",
      );
    });
  });

  describe("validateModeInteractions", () => {
    test("should return valid with no warnings for auto mode", () => {
      const result = validateModeInteractions(APPROVAL_MODES.AUTO);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    test("should warn about debug mode with strict approval", () => {
      const result = validateModeInteractions(APPROVAL_MODES.STRICT, {
        debug: true,
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Debug mode with strict approval may expose sensitive information",
      );
    });

    test("should warn about auto mode in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const result = validateModeInteractions(APPROVAL_MODES.AUTO);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Auto approval mode in production may pose security risks",
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Constants", () => {
    test("should have correct approval mode constants", () => {
      expect(APPROVAL_MODES.AUTO).toBe("auto");
      expect(APPROVAL_MODES.MANUAL).toBe("manual");
      expect(APPROVAL_MODES.STRICT).toBe("strict");
    });

    test("should have correct default mode", () => {
      expect(DEFAULT_MODE).toBe(APPROVAL_MODES.AUTO);
    });
  });
});