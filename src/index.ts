#!/usr/bin/env bun
import { textToAsciiArt } from "./fonts";

const c = (n: number) => `\x1b[${n}m`;
const COLOR_MAP: Record<string, string> = {
  black: c(30),
  red: c(31),
  green: c(32),
  yellow: c(33),
  blue: c(34),
  magenta: c(35),
  cyan: c(36),
  white: c(37),
  orange: "\x1b[38;5;208m",
  purple: "\x1b[38;5;129m",
  pink: "\x1b[38;5;205m",
  gray: c(90),
  grey: c(90),
};

function parseColor(colorInput: string): string {
  return COLOR_MAP[colorInput.toLowerCase()] || COLOR_MAP.orange;
}

function showHelp(): void {
  const helpText = `ccsay - Display text in colorful ASCII art

Usage:
  ccsay [options] [text]
  echo "text" | ccsay [options]

Options:
  --help, -h       Show this help message
  --color, -c      Set text color (default: orange)
                   Available colors: black, red, green, yellow, blue, magenta,
                   cyan, white, orange, purple, pink, gray, grey

Examples:
  ccsay "Hello World"                    Display "Hello World" in ASCII art
  ccsay -c red "ERROR"                   Display "ERROR" in red
  ccsay "Line 1\\nLine 2"                 Multi-line text with newlines
  echo "Piped text" | ccsay              Read from stdin
  ccsay --color blue "BUILDING..."       Display in blue color

Version:
  0.0.2

For more information, visit: https://github.com/watany-dev/ccsay`;

  console.log(helpText);
}

export function main() {
  const args = process.argv.slice(2);

  // Check for help flags first
  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  let color = COLOR_MAP.orange;
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
