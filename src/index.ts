#!/usr/bin/env bun
import { textToAsciiArt } from "./fonts";

const COLOR_MAP: Record<string, string> = {
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  orange: "\x1b[38;5;208m", // Default orange color
  purple: "\x1b[38;5;129m",
  pink: "\x1b[38;5;205m",
  gray: "\x1b[90m",
  grey: "\x1b[90m",
};

function parseColor(colorInput: string): string {
  const color = colorInput.toLowerCase();
  return COLOR_MAP[color] || COLOR_MAP.orange || "\x1b[38;5;208m"; // Default to orange if color not found
}

export function main() {
  const args = process.argv.slice(2);
  let color = COLOR_MAP.orange; // Default color
  const textArgs: string[] = [];

  // Parse arguments for color option
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "-c" || arg === "--color") {
      // Get next argument as color value
      if (i + 1 < args.length) {
        color = parseColor(args[i + 1] || "");
        i++; // Skip the color value in next iteration
      }
    } else {
      textArgs.push(arg || "");
    }
  }

  // Rejoin args, looking for separated \n sequences
  let rawText: string;
  if (textArgs.length === 0) {
    // Check if stdin has data (piped input)
    if (!process.stdin.isTTY) {
      // Read from stdin
      let stdinData = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => {
        stdinData += chunk;
      });
      process.stdin.on("end", () => {
        const text = stdinData.trim();
        const asciiArt = textToAsciiArt(text);
        console.log(`${color}${asciiArt}\x1b[0m`);
      });
      return;
    }
    rawText = "CLAUDE\nCODE";
  } else {
    const parts: string[] = [];
    for (let i = 0; i < textArgs.length; i++) {
      const currentArg = textArgs[i];
      if (!currentArg) continue;

      if (i > 0 && currentArg.startsWith("n")) {
        const prevArg = textArgs[i - 1];
        if (prevArg?.endsWith("\\")) {
          // Remove the trailing \ from previous part and add \n
          if (parts.length > 0) {
            const lastPart = parts[parts.length - 1];
            if (lastPart) {
              parts[parts.length - 1] = lastPart.slice(0, -1);
            }
          }
          parts.push(`\\n${currentArg.slice(1)}`);
          continue;
        }
      }
      parts.push(currentArg);
    }
    rawText = parts.join(" ");
  }

  // Handle literal \n in command line arguments
  const text = rawText.replace(/\\n/g, "\n");

  const asciiArt = textToAsciiArt(text);
  console.log(`${color}${asciiArt}\x1b[0m`);
}

// Run when this file is executed directly
if (import.meta.main) {
  main();
}
