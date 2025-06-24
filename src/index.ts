#!/usr/bin/env bun
import { textToAsciiArt } from "./fonts";

const args = process.argv.slice(2);

// Rejoin args, looking for separated \n sequences
let rawText = "";
if (args.length > 0) {
  for (let i = 0; i < args.length; i++) {
    if (i > 0) {
      // Check if current arg starts with 'n' and previous arg ended with '\'
      if (args[i]?.startsWith("n") && args[i - 1]?.endsWith("\\")) {
        // Remove the trailing \ from previous part and add \n
        rawText = `${rawText.slice(0, -1)}\\n${args[i]?.slice(1)}`;
      } else {
        rawText += ` ${args[i]}`;
      }
    } else {
      rawText += args[i];
    }
  }
} else {
  rawText = "CLAUDE CODE";
}

// Handle literal \n in command line arguments
const text = rawText.replace(/\\n/g, "\n");

const asciiArt = textToAsciiArt(text);
console.log(`\x1b[38;5;208m${asciiArt}\x1b[0m`);
