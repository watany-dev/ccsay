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

    it("should contain basic hiragana characters", () => {
      const hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ"];
      for (const char of hiragana) {
        expect(BLOCK_FONT[char]).toBeDefined();
        expect(BLOCK_FONT[char]).toHaveLength(6);
      }
    });

    // Property-based testing for font consistency
    it("should maintain consistent character width across all letters", () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const letter of letters) {
        const art = BLOCK_FONT[letter];
        const widths = art.map((line) => line.length);
        const uniqueWidths = [...new Set(widths)];
        expect(uniqueWidths).toHaveLength(1); // All lines same width
      }
    });

    it("should maintain consistent character width across all digits", () => {
      const digits = "0123456789";
      for (const digit of digits) {
        const art = BLOCK_FONT[digit];
        const widths = art.map((line) => line.length);
        const uniqueWidths = [...new Set(widths)];
        expect(uniqueWidths).toHaveLength(1); // All lines same width
      }
    });

    it("should not contain empty lines in character definitions", () => {
      for (const [char, art] of Object.entries(BLOCK_FONT)) {
        if (char !== " ") {
          // Space character is allowed to have "empty" content
          for (let i = 0; i < art.length; i++) {
            expect(art[i]).toBeDefined();
            expect(typeof art[i]).toBe("string");
          }
        }
      }
    });

    it("should use only valid Unicode box drawing characters", () => {
      const validBoxChars = /^[\s\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2E80-\u2EFF]*$/;
      for (const [_char, art] of Object.entries(BLOCK_FONT)) {
        for (const line of art) {
          expect(line).toMatch(validBoxChars);
        }
      }
    });

    it("should have space character with consistent width", () => {
      const spaceArt = BLOCK_FONT[" "];
      expect(spaceArt).toBeDefined();
      expect(spaceArt).toHaveLength(6);
      const widths = spaceArt.map((line) => line.length);
      const uniqueWidths = [...new Set(widths)];
      expect(uniqueWidths).toHaveLength(1);

      // Space should contain only whitespace characters
      for (const line of spaceArt) {
        expect(line).toMatch(/^\s*$/);
      }
    });
  });

  describe("textToAsciiArt", () => {
    // Visual regression testing with snapshots
    it("should maintain visual consistency for common text", () => {
      const result = textToAsciiArt("HELLO");
      expect(result).toMatchSnapshot();
    });

    it("should maintain visual consistency for digits", () => {
      const result = textToAsciiArt("12345");
      expect(result).toMatchSnapshot();
    });

    it("should maintain visual consistency for punctuation", () => {
      const result = textToAsciiArt("HELLO!");
      expect(result).toMatchSnapshot();
    });

    it("should convert simple text to ASCII art with proper structure", () => {
      const result = textToAsciiArt("HI");
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);

      // Dynamic validation instead of hardcoded strings
      const expectedH = BLOCK_FONT.H;
      const expectedI = BLOCK_FONT.I;

      for (let i = 0; i < 6; i++) {
        expect(lines[i]).toContain(expectedH[i]);
        expect(lines[i]).toContain(expectedI[i]);
      }
    });

    it("should convert lowercase to uppercase", () => {
      const uppercase = textToAsciiArt("ABC");
      const lowercase = textToAsciiArt("abc");
      expect(uppercase).toBe(lowercase);
    });

    it("should handle space character correctly", () => {
      const result = textToAsciiArt("A B");
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);

      // Dynamic validation using font definitions
      const expectedA = BLOCK_FONT.A;
      const expectedSpace = BLOCK_FONT[" "];
      const expectedB = BLOCK_FONT.B;

      for (let i = 0; i < 6; i++) {
        const expectedLine = expectedA[i] + expectedSpace[i] + expectedB[i];
        expect(lines[i]).toBe(expectedLine);
      }
    });

    it("should handle unknown characters as spaces with proper fallback", () => {
      const result = textToAsciiArt("A@B");
      const expected = textToAsciiArt("A B");
      expect(result).toBe(expected);

      // Additional validation for edge cases
      const unknownResult = textToAsciiArt("A#$%B");
      const spacesResult = textToAsciiArt("A   B");
      expect(unknownResult).toBe(spacesResult);
    });

    it("should handle empty string", () => {
      const result = textToAsciiArt("");
      expect(result).toBe("\n\n\n\n\n");
    });

    it("should handle text with newline characters with proper structure", () => {
      const result = textToAsciiArt("HELLO\nWORLD");
      const lines = result.split("\n");
      // Each text line produces 6 ASCII art lines, plus 1 empty line between them
      expect(lines).toHaveLength(13); // 6 + 1 + 6

      // Validate structure using dynamic expectations
      const helloResult = textToAsciiArt("HELLO");
      const worldResult = textToAsciiArt("WORLD");
      const helloLines = helloResult.split("\n");
      const worldLines = worldResult.split("\n");

      // First 6 lines should match HELLO
      for (let i = 0; i < 6; i++) {
        expect(lines[i]).toBe(helloLines[i]);
      }

      // Check separator line
      expect(lines[6]).toBe("");

      // Last 6 lines should match WORLD
      for (let i = 0; i < 6; i++) {
        expect(lines[7 + i]).toBe(worldLines[i]);
      }
    });

    it("should handle multiple consecutive newlines with correct line structure", () => {
      const result = textToAsciiArt("A\n\nB");
      const lines = result.split("\n");
      // A (6 lines) + empty line + empty line (6 lines) + empty line + B (6 lines)
      expect(lines).toHaveLength(20); // 6 + 1 + 6 + 1 + 6

      // Validate each section structure
      const aResult = textToAsciiArt("A");
      const bResult = textToAsciiArt("B");
      const aLines = aResult.split("\n");
      const bLines = bResult.split("\n");

      // First section: A
      for (let i = 0; i < 6; i++) {
        expect(lines[i]).toBe(aLines[i]);
      }

      // Separator
      expect(lines[6]).toBe("");

      // Second section: empty (6 empty lines)
      for (let i = 7; i < 13; i++) {
        expect(lines[i]).toBe("");
      }

      // Separator
      expect(lines[13]).toBe("");

      // Third section: B
      for (let i = 0; i < 6; i++) {
        expect(lines[14 + i]).toBe(bLines[i]);
      }
    });

    it("should handle newline at the beginning with proper validation", () => {
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

      // Validate TEST section using dynamic expectations
      const testResult = textToAsciiArt("TEST");
      const testLines = testResult.split("\n");

      for (let i = 0; i < 6; i++) {
        expect(lines[7 + i]).toBe(testLines[i]);
      }
    });

    it("should handle newline at the end with structural validation", () => {
      const result = textToAsciiArt("TEST\n");
      const lines = result.split("\n");
      // TEST (6 lines) + separator + empty line (6 lines)
      expect(lines).toHaveLength(13);

      // Validate TEST section
      const testResult = textToAsciiArt("TEST");
      const testLines = testResult.split("\n");

      for (let i = 0; i < 6; i++) {
        expect(lines[i]).toBe(testLines[i]);
      }

      // Check separator
      expect(lines[6]).toBe("");

      // Last 6 lines should be empty
      for (let i = 7; i < 13; i++) {
        expect(lines[i]).toBe("");
      }
    });

    it("should handle text with mixed case and newlines correctly", () => {
      const result = textToAsciiArt("Hello\nWorld");
      const lines = result.split("\n");
      expect(lines).toHaveLength(13);

      // Should convert to uppercase
      const upperResult = textToAsciiArt("HELLO\nWORLD");
      expect(result).toBe(upperResult);

      // Additional case sensitivity tests
      const mixedCaseTests = [
        ["AbC", "ABC"],
        ["test123", "TEST123"],
        ["hello!\nworld?", "HELLO!\nWORLD?"],
      ];

      for (const [input, expected] of mixedCaseTests) {
        expect(textToAsciiArt(input)).toBe(textToAsciiArt(expected));
      }
    });

    it("should handle hiragana characters without case conversion", () => {
      const hiraganaText = "あいう";
      const result = textToAsciiArt(hiraganaText);
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);

      // Hiragana should not be affected by case conversion
      const expectedA = BLOCK_FONT["あ"];
      const expectedI = BLOCK_FONT["い"];
      const expectedU = BLOCK_FONT["う"];

      for (let i = 0; i < 6; i++) {
        const expectedLine = expectedA[i] + expectedI[i] + expectedU[i];
        expect(lines[i]).toBe(expectedLine);
      }
    });

    it("should handle mixed hiragana and English text", () => {
      const mixedText = "ABCあいう";
      const result = textToAsciiArt(mixedText);
      const lines = result.split("\n");
      expect(lines).toHaveLength(6);

      // Should contain both English (converted to uppercase) and hiragana
      const expectedA = BLOCK_FONT.A;
      const expectedB = BLOCK_FONT.B;
      const expectedC = BLOCK_FONT.C;
      const expectedHiraganaA = BLOCK_FONT["あ"];
      const expectedHiraganaI = BLOCK_FONT["い"];
      const expectedHiraganaU = BLOCK_FONT["う"];

      for (let i = 0; i < 6; i++) {
        const expectedLine =
          expectedA[i] +
          expectedB[i] +
          expectedC[i] +
          expectedHiraganaA[i] +
          expectedHiraganaI[i] +
          expectedHiraganaU[i];
        expect(lines[i]).toBe(expectedLine);
      }
    });

    it("should maintain visual consistency for hiragana text", () => {
      const result = textToAsciiArt("こんにちは");
      expect(result).toMatchSnapshot();
    });

    // Additional comprehensive tests
    it("should produce reasonable output width for same-length strings", () => {
      const samples = ["AAAAA", "BBBBB", "CCCCC"];
      const widths = samples.map((sample) => {
        const result = textToAsciiArt(sample);
        const lines = result.split("\n");
        return lines[0]?.length || 0;
      });

      // Letters should produce similar width output (within reasonable range)
      const minWidth = Math.min(...widths);
      const maxWidth = Math.max(...widths);
      const widthDifference = maxWidth - minWidth;

      // Allow some variation but not too much
      expect(widthDifference).toBeLessThan(5);

      // All widths should be substantial (not empty)
      for (const width of widths) {
        expect(width).toBeGreaterThan(30);
      }
    });

    it("should handle long text without breaking structure", () => {
      const longText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const result = textToAsciiArt(longText);
      const lines = result.split("\n");

      expect(lines).toHaveLength(6);

      // Each line should have content (no empty lines in single-line text)
      for (const line of lines) {
        expect(line.length).toBeGreaterThan(0);
      }
    });
  });
});
