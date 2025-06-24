import { describe, expect, it } from "vitest";
import { BLOCK_FONT, textToAsciiArt } from "../src/fonts";

describe("fonts", () => {
  describe("BLOCK_FONT", () => {
    it("should contain all uppercase letters", () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const letter of letters) {
        expect(BLOCK_FONT[letter]).toBeDefined();
        expect(BLOCK_FONT[letter]).toHaveLength(6);
      }
    });

    it("should contain all digits", () => {
      const digits = "0123456789";
      for (const digit of digits) {
        expect(BLOCK_FONT[digit]).toBeDefined();
        expect(BLOCK_FONT[digit]).toHaveLength(6);
      }
    });

    it("should contain common punctuation", () => {
      const punctuation = [" ", "!", "?", ".", ",", "-"];
      for (const char of punctuation) {
        expect(BLOCK_FONT[char]).toBeDefined();
        expect(BLOCK_FONT[char]).toHaveLength(6);
      }
    });
  });

  describe("textToAsciiArt", () => {
    it("should convert simple text to ASCII art", () => {
      const result = textToAsciiArt("HI");
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);
      expect(result).toContain("██╗  ██╗");
      expect(result).toContain("██║");
    });

    it("should convert lowercase to uppercase", () => {
      const uppercase = textToAsciiArt("ABC");
      const lowercase = textToAsciiArt("abc");
      expect(uppercase).toBe(lowercase);
    });

    it("should handle space character", () => {
      const result = textToAsciiArt("A B");
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);
      expect(lines[0]).toContain(" █████╗         ██████╗ ");
    });

    it("should handle unknown characters as spaces", () => {
      const result = textToAsciiArt("A@B");
      const expected = textToAsciiArt("A B");
      expect(result).toBe(expected);
    });

    it("should handle empty string", () => {
      const result = textToAsciiArt("");
      expect(result).toBe("\n\n\n\n\n");
    });

    it("should handle text with newline characters", () => {
      const result = textToAsciiArt("HELLO\nWORLD");
      const lines = result.split("\n");
      // Each text line produces 6 ASCII art lines, plus 1 empty line between them
      expect(lines).toHaveLength(13); // 6 + 1 + 6
      
      // Check that the first line starts with H
      expect(lines[0]).toContain("██╗  ██╗");
      
      // Check that there's an empty line between HELLO and WORLD
      expect(lines[6]).toBe("");
      
      // Check that WORLD starts on line 7
      expect(lines[7]).toContain("██╗    ██╗");
    });

    it("should handle multiple consecutive newlines", () => {
      const result = textToAsciiArt("A\n\nB");
      const lines = result.split("\n");
      // A (6 lines) + empty line + empty line (6 lines) + empty line + B (6 lines)
      expect(lines).toHaveLength(20); // 6 + 1 + 6 + 1 + 6
    });

    it("should handle newline at the beginning", () => {
      const result = textToAsciiArt("\nTEST");
      const lines = result.split("\n");
      // Empty line (6 lines) + separator + TEST (6 lines)
      expect(lines).toHaveLength(13);
      
      // First 6 lines should be empty
      for (let i = 0; i < 6; i++) {
        expect(lines[i]).toBe("");
      }
      
      // Line 6 should be the separator
      expect(lines[6]).toBe("");
      
      // TEST should start at line 7
      expect(lines[7]).toContain("████████╗");
    });

    it("should handle newline at the end", () => {
      const result = textToAsciiArt("TEST\n");
      const lines = result.split("\n");
      // TEST (6 lines) + separator + empty line (6 lines)
      expect(lines).toHaveLength(13);
      
      // Last 6 lines should be empty
      for (let i = 7; i < 13; i++) {
        expect(lines[i]).toBe("");
      }
    });

    it("should handle text with mixed case and newlines", () => {
      const result = textToAsciiArt("Hello\nWorld");
      const lines = result.split("\n");
      expect(lines).toHaveLength(13);
      
      // Should convert to uppercase
      const upperResult = textToAsciiArt("HELLO\nWORLD");
      expect(result).toBe(upperResult);
    });
  });
});
