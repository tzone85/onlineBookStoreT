#!/usr/bin/env node

const yargs = require("yargs");

/**
 * Codex CLI - Command line interface for the online book store
 * Supports various operations and configuration options
 */
class CodexCLI {
  constructor() {
    this.context = {};
  }

  /**
   * Parse command line arguments and return the CLI context
   */
  parseArgs(argv = process.argv) {
    const parser = yargs(argv.slice(2))
      .scriptName("codex")
      .usage("Usage: $0 [options]")
      .option("approval-mode", {
        describe: "Set the approval mode for operations",
        type: "string",
        choices: ["auto", "manual", "prompt"],
        default: "manual",
      })
      .help("h")
      .alias("h", "help")
      .version("1.0.0")
      .example("$0 --approval-mode auto", "Run with automatic approval mode")
      .example("$0 --approval-mode manual", "Run with manual approval mode")
      .example("$0 --approval-mode prompt", "Run with prompt approval mode");

    const args = parser.argv;

    // Store the approval-mode flag value in CLI context
    this.context.approvalMode = args["approval-mode"];

    return {
      context: this.context,
      args: args,
    };
  }

  /**
   * Get the current CLI context
   */
  getContext() {
    return this.context;
  }
}

// Export the CLI class for testing
module.exports = { CodexCLI };

// If this file is run directly, parse arguments and show context
if (require.main === module) {
  const cli = new CodexCLI();
  const result = cli.parseArgs();

  console.log("Codex CLI initialized successfully");
  console.log("Approval Mode:", result.context.approvalMode);
  console.log("Full Context:", result.context);
}
