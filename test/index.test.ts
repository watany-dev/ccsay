import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { main } from "../src/index";

describe("index", () => {
  let consoleLogSpy: MockInstance;
  let processArgvBackup: string[];

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    processArgvBackup = process.argv;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    process.argv = processArgvBackup;
  });

  describe("parseColor", () => {
    it("should parse valid color names", () => {
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
        consoleLogSpy.mockClear();
        process.argv = ["node", "index.ts", "-c", input, "TEST"];
        main();
        const output = consoleLogSpy.mock.calls[0]?.[0];
        expect(output).toContain(expected);
      }
    });

    it("should be case insensitive", () => {
      process.argv = ["node", "index.ts", "-c", "RED", "TEST"];
      main();
      const output1 = consoleLogSpy.mock.calls[0]?.[0];
      expect(output1).toContain("\x1b[31m");

      consoleLogSpy.mockClear();

      process.argv = ["node", "index.ts", "-c", "rEd", "TEST"];
      main();
      const output2 = consoleLogSpy.mock.calls[0]?.[0];
      expect(output2).toContain("\x1b[31m");
    });

    it("should default to orange for invalid colors", () => {
      process.argv = ["node", "index.ts", "-c", "invalidcolor", "TEST"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[38;5;208m"); // Orange
    });
  });

  describe("command line parsing", () => {
    it("should support -c flag", () => {
      process.argv = ["node", "index.ts", "-c", "red", "HELLO"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[31m"); // Red color
      expect(output).toContain("██╗  ██╗"); // H from HELLO
    });

    it("should support --color flag", () => {
      process.argv = ["node", "index.ts", "--color", "blue", "WORLD"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[34m"); // Blue color
      expect(output).toContain("██╗    ██╗"); // W from WORLD
    });

    it("should handle color flag with multiple text arguments", () => {
      process.argv = ["node", "index.ts", "-c", "green", "HELLO", "WORLD"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[32m"); // Green color
      expect(output).toContain("██╗  ██╗"); // H from HELLO
      expect(output).toContain("██╗    ██╗"); // W from WORLD
    });

    it("should handle color flag in different positions", () => {
      process.argv = ["node", "index.ts", "BEFORE", "-c", "cyan", "AFTER"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[36m"); // Cyan color
      // Should contain both BEFORE and AFTER text
      expect(output).toContain("██████╗ "); // B from BEFORE
      expect(output).toContain(" █████╗ "); // A from AFTER
    });

    it("should use default text when -c has no value", () => {
      // Mock stdin to not be TTY
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = true; // Ensure stdin is TTY so it uses default text

      process.argv = ["node", "index.ts", "-c"];
      main();
      // When -c has no value and no text args, it should default to CLAUDE CODE
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[38;5;208m"); // Default orange
      expect(output).toContain("██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗"); // CLAUDE

      // Restore original value
      process.stdin.isTTY = originalIsTTY;
    });

    it("should treat color flag as text if no value follows", () => {
      process.argv = ["node", "index.ts", "TEXT", "-c"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[38;5;208m"); // Default orange
      // Should contain TEXT but not -c in the output
      expect(output).toContain("████████╗"); // T from TEXT
    });
  });

  describe("color output", () => {
    it("should use default orange when no color specified", () => {
      process.argv = ["node", "index.ts", "DEFAULT"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[38;5;208m"); // Orange
      expect(output).toContain("\x1b[0m"); // Reset at the end
    });

    it("should properly reset color at the end", () => {
      process.argv = ["node", "index.ts", "-c", "red", "TEST"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[31m"); // Red
      expect(output.endsWith("\x1b[0m")).toBe(true); // Reset at the end
    });

    it("should work with newline characters", () => {
      process.argv = ["node", "index.ts", "-c", "blue", "HELLO\\nWORLD"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[34m"); // Blue
      const lines = output.split("\n");
      expect(lines.length).toBeGreaterThan(7); // Multiple lines for multi-line text
    });

    it("should work with color and explicit text", () => {
      process.argv = ["node", "index.ts", "-c", "green", "TEST"];
      main();
      const output = consoleLogSpy.mock.calls[0]?.[0];
      expect(output).toContain("\x1b[32m"); // Green
      expect(output).toContain("████████╗███████╗███████╗████████╗"); // TEST in ASCII art
    });
  });
});
