// Simple integration test for CLI functionality without yargs dependency issues
const { spawn } = require("child_process");

describe("Codex CLI Integration Tests", () => {
  // Helper function to run CLI and capture output
  const runCLI = (args = []) => {
    return new Promise((resolve, reject) => {
      const child = spawn("node", ["cli.js", ...args], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        resolve({ code, stdout, stderr });
      });

      child.on("error", reject);
    });
  };

  describe("CLI accepts --approval-mode flag without errors", () => {
    test("should accept --approval-mode auto", async () => {
      const result = await runCLI(["--approval-mode", "auto"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Approval Mode: auto");
      expect(result.stdout).toContain("Codex CLI initialized successfully");
    }, 10000);

    test("should accept --approval-mode manual", async () => {
      const result = await runCLI(["--approval-mode", "manual"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Approval Mode: manual");
    }, 10000);

    test("should accept --approval-mode prompt", async () => {
      const result = await runCLI(["--approval-mode", "prompt"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Approval Mode: prompt");
    }, 10000);

    test("should use default manual mode when no flag provided", async () => {
      const result = await runCLI();

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Approval Mode: manual");
    }, 10000);

    test("should reject invalid approval-mode values", async () => {
      const result = await runCLI(["--approval-mode", "invalid"]);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Invalid values");
      expect(result.stderr).toContain("approval-mode");
    }, 10000);
  });

  describe("Help text shows --approval-mode option", () => {
    test("should show approval-mode option in help", async () => {
      const result = await runCLI(["--help"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("--approval-mode");
      expect(result.stdout).toContain("Set the approval mode for operations");
      expect(result.stdout).toContain('choices: "auto", "manual", "prompt"');
      expect(result.stdout).toContain('default: "manual"');
    }, 10000);
  });

  describe("Flag value is captured and stored in CLI context", () => {
    test("should capture and display approval mode in context", async () => {
      const result = await runCLI(["--approval-mode", "auto"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Full Context:");
      expect(result.stdout).toContain("approvalMode: 'auto'");
    }, 10000);
  });

  describe("All existing CLI functionality remains unchanged", () => {
    test("should show version when requested", async () => {
      const result = await runCLI(["--version"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("1.0.0");
    }, 10000);

    test("should show help when requested", async () => {
      const result = await runCLI(["--help"]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Usage: codex [options]");
      expect(result.stdout).toContain("Examples:");
    }, 10000);
  });
});
