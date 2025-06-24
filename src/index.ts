#!/usr/bin/env bun
import { textToAsciiArt } from "./fonts";

const args = process.argv.slice(2);
const text = args.length > 0 ? args.join(" ") : "CLAUDE CODE";

const asciiArt = textToAsciiArt(text);
console.log(`\x1b[38;5;208m${asciiArt}\x1b[0m`);
