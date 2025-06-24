#!/usr/bin/env bun
import { textToAsciiArt } from "./fonts";

const args = process.argv.slice(2);

// Rejoin args, looking for separated \n sequences
let rawText: string;
if (args.length === 0) {
  rawText = "CLAUDE\nCODE";
} else {
  const parts: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const currentArg = args[i];
    if (!currentArg) continue;

    if (i > 0 && currentArg.startsWith("n")) {
      const prevArg = args[i - 1];
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
console.log(`\x1b[38;5;208m${asciiArt}\x1b[0m`);
