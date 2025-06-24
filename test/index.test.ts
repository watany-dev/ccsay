import { exec } from "node:child_process";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { main } from "../src/index";

const execAsync = promisify(exec);

describe("index", () => {
  let consoleLogSpy: MockInstance;
  let processArgvBackup: string[];
  let capturedOutput: string[];

  beforeEach(() => {
    capturedOutput = [];
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation((msg) => {
      capturedOutput.push(msg);
    });
    processArgvBackup = process.argv;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.argv = processArgvBackup;
  });

  describe("color parsing and output", () => {
    it("should parse valid color names and apply them correctly", () => {
      const testCases = [
        { input: "red", expected: "\x1b[31m" },
        { input: "green", expected: "\x1b[32m" },
        { input: "blue", expected: "\x1b[34m" },
        { input: "yellow", expected: "\x1b[33m" },
        { input: "cyan", expected: "\x1b[36m" },
        { input: "magenta", expected: "\x1b[35m" },
        { input: "black", expected: "\x1b[30m" },
        { input: "white", expected: "\x1b[37m" },
        { input: "orange", expected: "\x1b[38;5;208m" },
        { input: "purple", expected: "\x1b[38;5;129m" },
        { input: "pink", expected: "\x1b[38;5;205m" },
        { input: "gray", expected: "\x1b[90m" },
        { input: "grey", expected: "\x1b[90m" },
      ];

      for (const { input, expected } of testCases) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", "-c", input, "TEST"];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];

        // Verify color code is present
        expect(output).toContain(expected);

        // Verify reset code is at the end
        expect(output).toMatch(/\x1b\[0m$/);

        // Verify ASCII art content is present
        expect(output).toContain("█");

        // Verify structure: color + content + reset (multiline)
        expect(output).toMatch(/^\x1b\[[0-9;]+m[\s\S]*\x1b\[0m$/);
      }
    });

    it("should be case insensitive for color names", () => {
      const testCases = ["RED", "red", "Red", "rEd", "ReD"];
      const expectedColor = "\x1b[31m";

      for (const colorInput of testCases) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", "-c", colorInput, "TEST"];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];
        expect(output).toContain(expectedColor);
      }
    });

    it("should default to orange for invalid colors with proper fallback", () => {
      const invalidColors = ["invalidcolor", "rainbow", "transparent", "", "123abc", "#ff0000"];
      const expectedOrange = "\x1b[38;5;208m";

      for (const invalidColor of invalidColors) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", "-c", invalidColor, "TEST"];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];
        expect(output).toContain(expectedOrange);

        // Should still contain ASCII art
        expect(output).toContain("█");

        // Should have proper reset
        expect(output).toMatch(/\x1b\[0m$/);
      }
    });
  });

  describe("command line parsing", () => {
    it("should support -c flag with comprehensive validation", () => {
      process.argv = ["node", "index.ts", "-c", "red", "HELLO"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Color validation
      expect(output).toContain("\x1b[31m"); // Red color

      // Content validation - should contain the actual HELLO text
      const lines = output.split("\n");
      expect(lines).toHaveLength(6); // ASCII art should have 6 lines

      // Validate each line contains parts of HELLO
      const helloResult = require("../src/fonts").textToAsciiArt("HELLO");
      const expectedLines = helloResult.split("\n");

      for (let i = 0; i < 6; i++) {
        // Remove color codes for comparison
        const cleanLine = lines[i]?.replace(/\x1b\[[0-9;]*m/g, "");
        expect(cleanLine).toBe(expectedLines[i]);
      }
    });

    it("should support --color flag with full output validation", () => {
      process.argv = ["node", "index.ts", "--color", "blue", "WORLD"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Color validation
      expect(output).toContain("\x1b[34m"); // Blue color

      // Structure validation
      const lines = output.split("\n");
      expect(lines).toHaveLength(6);

      // Content validation
      const worldResult = require("../src/fonts").textToAsciiArt("WORLD");
      const expectedLines = worldResult.split("\n");

      for (let i = 0; i < 6; i++) {
        const cleanLine = lines[i]?.replace(/\x1b\[[0-9;]*m/g, "");
        expect(cleanLine).toBe(expectedLines[i]);
      }
    });

    it("should handle color flag with multiple text arguments correctly", () => {
      process.argv = ["node", "index.ts", "-c", "green", "HELLO", "WORLD"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Color validation
      expect(output).toContain("\x1b[32m"); // Green color

      // Content validation - multiple arguments should be joined with spaces
      const expectedResult = require("../src/fonts").textToAsciiArt("HELLO WORLD");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);
    });

    it("should handle color flag in different positions with proper parsing", () => {
      process.argv = ["node", "index.ts", "BEFORE", "-c", "cyan", "AFTER"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Color validation
      expect(output).toContain("\x1b[36m"); // Cyan color

      // Content validation - should parse as "BEFORE AFTER"
      const expectedResult = require("../src/fonts").textToAsciiArt("BEFORE AFTER");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);
    });

    it("should use default text when -c has no value with proper default handling", () => {
      // Mock stdin to be TTY
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true; // Ensure stdin is TTY so it uses default text

      process.argv = ["node", "index.ts", "-c"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // When -c has no value and no text args, it should default to CLAUDE\nCODE
      expect(output).toContain("\x1b[38;5;208m"); // Default orange

      // Validate default content structure
      const expectedResult = require("../src/fonts").textToAsciiArt("CLAUDE\nCODE");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);

      // Restore original value
      process.stdin.isTTY = originalIsTTY;
    });

    it("should treat color flag as text if no value follows with correct parsing", () => {
      process.argv = ["node", "index.ts", "TEXT", "-c"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("\x1b[38;5;208m"); // Default orange

      // Should contain only TEXT (not -c)
      const expectedResult = require("../src/fonts").textToAsciiArt("TEXT");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);
    });
  });

  describe("color output validation", () => {
    it("should use default orange when no color specified with complete validation", () => {
      process.argv = ["node", "index.ts", "DEFAULT"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("\x1b[38;5;208m"); // Orange
      expect(output).toMatch(/\x1b\[0m$/); // Reset at the end

      // Validate content structure
      const expectedResult = require("../src/fonts").textToAsciiArt("DEFAULT");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);
    });

    it("should properly reset color at the end for all colors", () => {
      const colors = ["red", "green", "blue", "yellow", "cyan", "magenta", "orange"];

      for (const color of colors) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", "-c", color, "TEST"];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];

        // Should have color at the start
        expect(output).toMatch(/^\x1b\[[0-9;]+m/);

        // Should have reset at the end
        expect(output).toMatch(/\x1b\[0m$/);

        // Should not have reset in the middle (only at the end)
        const withoutEnd = output.slice(0, -4); // Remove \x1b[0m
        expect(withoutEnd).not.toContain("\x1b[0m");
      }
    });

    it("should work with newline characters with proper structure validation", () => {
      process.argv = ["node", "index.ts", "-c", "blue", "HELLO\\nWORLD"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("\x1b[34m"); // Blue

      // Validate multi-line structure
      const lines = output.split("\n");
      expect(lines).toHaveLength(13); // 6 + 1 + 6 for HELLO\nWORLD

      // Validate content matches expected multi-line ASCII art
      const expectedResult = require("../src/fonts").textToAsciiArt("HELLO\nWORLD");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);
    });

    it("should work with color and explicit text with comprehensive validation", () => {
      process.argv = ["node", "index.ts", "-c", "green", "TEST"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("\x1b[32m"); // Green

      // Validate complete structure and content
      const expectedResult = require("../src/fonts").textToAsciiArt("TEST");
      const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

      expect(cleanOutput).toBe(expectedResult);

      // Validate format: color + content + reset (multiline)
      expect(output).toMatch(/^\x1b\[32m[\s\S]*\x1b\[0m$/);
    });
  });

  describe("help functionality", () => {
    it("should display help when --help flag is used with complete validation", () => {
      process.argv = ["node", "index.ts", "--help"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Required sections
      expect(output).toContain("Usage:");
      expect(output).toContain("ccsay");
      expect(output).toContain("Options:");
      expect(output).toContain("--help, -h");
      expect(output).toContain("--color, -c");
      expect(output).toContain("Examples:");
      expect(output).toContain("Version:");

      // Should not contain ASCII art
      expect(output).not.toContain("█");

      // Should not contain color codes
      expect(output).not.toMatch(/\x1b\[[0-9;]*m/);

      // Should contain practical examples
      expect(output).toContain('ccsay "Hello World"');

      // Should contain version information
      expect(output).toContain("0.0.2");
    });

    it("should display help when -h flag is used with identical output", () => {
      // Test -h flag
      process.argv = ["node", "index.ts", "-h"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const shortFlagOutput = capturedOutput[0];

      // Test --help flag
      capturedOutput.length = 0;
      process.argv = ["node", "index.ts", "--help"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const longFlagOutput = capturedOutput[0];

      // Both should produce identical output
      expect(shortFlagOutput).toBe(longFlagOutput);

      // Basic validation
      expect(shortFlagOutput).toContain("Usage:");
      expect(shortFlagOutput).not.toContain("█");
    });

    it("should display help when --help is mixed with other arguments with priority validation", () => {
      const testCases = [
        ["SOME_TEXT", "--help", "-c", "red"],
        ["--help", "SOME_TEXT"],
        ["-c", "blue", "--help", "TEXT"],
        ["--help"],
      ];

      const expectedOutput = (() => {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", "--help"];
        main();
        return capturedOutput[0];
      })();

      for (const args of testCases) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", ...args];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];

        // Help should always have priority and produce identical output
        expect(output).toBe(expectedOutput);

        // Should not contain ASCII art even with other args
        expect(output).not.toContain("█");
      }
    });

    it("should display help when -h is mixed with other arguments with consistent behavior", () => {
      const testCases = [["-c", "blue", "-h", "TEXT"], ["-h", "-c", "red"], ["TEXT", "-h"], ["-h"]];

      for (const args of testCases) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", ...args];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];

        expect(output).toContain("Usage:");
        expect(output).toContain("ccsay");
        expect(output).not.toContain("█");
        expect(output).not.toMatch(/\x1b\[[0-9;]*m/);
      }
    });

    it("should contain comprehensive examples in help output", () => {
      process.argv = ["node", "index.ts", "--help"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("Examples:");

      // Specific examples that should be present
      const expectedExamples = [
        'ccsay "Hello World"',
        'ccsay -c red "ERROR"',
        'echo "Piped text" | ccsay',
        'ccsay --color blue "BUILDING..."',
      ];

      for (const example of expectedExamples) {
        expect(output).toContain(example);
      }
    });

    it("should contain version information in help output with validation", () => {
      process.argv = ["node", "index.ts", "--help"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      expect(output).toContain("Version:");
      expect(output).toContain("0.0.2");

      // Version should match package.json
      const packageJson = require("../package.json");
      expect(output).toContain(packageJson.version);
    });
  });

  // Integration tests with real command execution
  describe("integration tests", () => {
    it("should produce correct output when executed as a command", async () => {
      const { stdout } = await execAsync('bun run src/index.ts "TEST"');

      // Should contain ASCII art
      expect(stdout).toContain("█");

      // Should contain color codes
      expect(stdout).toMatch(/\x1b\[[0-9;]+m/);

      // Should have proper structure
      const lines = stdout.trim().split("\n");
      expect(lines).toHaveLength(6);
    });

    it("should handle color flags in command execution", async () => {
      const { stdout } = await execAsync('bun run src/index.ts -c red "HELLO"');

      expect(stdout).toContain("\x1b[31m"); // Red color
      expect(stdout).toContain("█");
      expect(stdout).toMatch(/\x1b\[0m/);
    });

    it("should display help when executed with --help", async () => {
      const { stdout } = await execAsync("bun run src/index.ts --help");

      expect(stdout).toContain("Usage:");
      expect(stdout).toContain("ccsay");
      expect(stdout).not.toContain("█");
    });

    it("should handle multi-line text in command execution", async () => {
      const { stdout } = await execAsync('bun run src/index.ts "LINE1\\nLINE2"');

      const lines = stdout.trim().split("\n");
      expect(lines).toHaveLength(13); // 6 + 1 + 6

      // Should contain separator - check if line 6 has only color codes or is empty when cleaned
      const cleanSeparator = lines[6]?.replace(/\x1b\[[0-9;]*m/g, "");
      expect(cleanSeparator).toBe("");
    });
  });

  // Performance and edge case tests
  describe("edge cases and performance", () => {
    it("should handle empty arguments gracefully", () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true; // Ensure TTY mode for default text

      process.argv = ["node", "index.ts"];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      // Should default to CLAUDE\nCODE
      expect(output).toContain("█");
      expect(output).toContain("\x1b[38;5;208m"); // Orange

      process.stdin.isTTY = originalIsTTY;
    });

    it("should handle very long text without breaking", () => {
      const longText = "A".repeat(100);
      process.argv = ["node", "index.ts", longText];
      main();

      expect(capturedOutput).toHaveLength(1);
      const output = capturedOutput[0];

      const lines = output.split("\n");
      expect(lines).toHaveLength(6);

      // Each line should have substantial content
      for (const line of lines) {
        const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, "");
        expect(cleanLine.length).toBeGreaterThan(50);
      }
    });

    it("should handle special characters in arguments", () => {
      const specialTexts = ["TEST!", "HELLO?", "A.B.C", "X-Y-Z"];

      for (const text of specialTexts) {
        capturedOutput.length = 0;
        process.argv = ["node", "index.ts", text];
        main();

        expect(capturedOutput).toHaveLength(1);
        const output = capturedOutput[0];

        expect(output).toContain("█");
        // Updated regex to handle multiline content
        expect(output).toMatch(/^\x1b\[[0-9;]+m[\s\S]*\x1b\[0m$/);
      }
    });
  });
});
