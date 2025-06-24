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
  });
});