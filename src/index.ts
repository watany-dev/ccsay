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
  const colorDemo = (colorKey: string, colorCode: string) => 
    `${colorCode}${colorKey.padEnd(8)}${c(0)}`;

  const helpText = `ccsay - Display text in colorful ASCII block art

╔══════════════════════════════════════════════════════════════════════════════╗
║                                  USAGE                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

Basic Usage:
  ccsay [text]                    Display text in ASCII art (default: "CLAUDE CODE")
  ccsay [options] [text]          Display text with options
  echo "text" | ccsay [options]   Read text from stdin/pipe

╔══════════════════════════════════════════════════════════════════════════════╗
║                                 OPTIONS                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

  --help, -h              Show this comprehensive help message
  --color, -c <color>     Set text color (default: orange)

╔══════════════════════════════════════════════════════════════════════════════╗
║                              AVAILABLE COLORS                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

${colorDemo("black", COLOR_MAP.black)}  ${colorDemo("red", COLOR_MAP.red)}    ${colorDemo("green", COLOR_MAP.green)}  ${colorDemo("yellow", COLOR_MAP.yellow)}
${colorDemo("blue", COLOR_MAP.blue)}   ${colorDemo("magenta", COLOR_MAP.magenta)}${colorDemo("cyan", COLOR_MAP.cyan)}   ${colorDemo("white", COLOR_MAP.white)}
${colorDemo("orange", COLOR_MAP.orange)}  ${colorDemo("purple", COLOR_MAP.purple)} ${colorDemo("pink", COLOR_MAP.pink)}   ${colorDemo("gray", COLOR_MAP.gray)}

╔══════════════════════════════════════════════════════════════════════════════╗
║                            SUPPORTED CHARACTERS                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Letters:     A-Z (automatically converted to uppercase)
Numbers:     0-9
Punctuation: ! ? . , -
Special:     space (for spacing between words)
Newlines:    \\n (use \\\\n in command line or actual newlines in pipes)

╔══════════════════════════════════════════════════════════════════════════════╗
║                                 EXAMPLES                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

Basic Examples:
  ccsay                           Default text: "CLAUDE CODE"
  ccsay "HELLO"                   Display "HELLO"
  ccsay "Hello World"             Display "HELLO WORLD" (auto-uppercase)

Color Examples:
  ccsay -c red "ERROR"            Red text
  ccsay --color blue "INFO"       Blue text
  ccsay -c green "SUCCESS"        Green text

Multi-line Examples:
  ccsay "LINE 1\\nLINE 2"          Two lines of text
  ccsay "TOP\\nMIDDLE\\nBOTTOM"     Three lines of text

Pipe Examples:
  echo "PIPED TEXT" | ccsay       Read from pipe
  echo "DATA" | ccsay -c cyan     Colored pipe input
  cat file.txt | ccsay           Display file content

Real-world Examples:
  ccsay -c red "BUILD FAILED"     Error messages
  ccsay -c green "DEPLOYED"       Success messages  
  ccsay -c yellow "WARNING"       Warning messages
  ccsay -c blue "LOADING..."      Status messages

╔══════════════════════════════════════════════════════════════════════════════╗
║                              TROUBLESHOOTING                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

Common Issues:
  • Unsupported characters display as spaces
  • Use quotes around text with spaces: ccsay "HELLO WORLD"
  • For literal \\n in terminal: ccsay "LINE1\\\\nLINE2"
  • Colors not showing? Check terminal color support
  • Pipe input not working? Ensure data is being piped: echo "text" | ccsay

Character Issues:
  • Lowercase letters are converted to uppercase automatically
  • Unsupported symbols (like @#$%^&*) appear as spaces
  • International characters are not supported

Performance:
  • Large amounts of text may be slow to render
  • Each character is ~6 lines tall, plan accordingly

╔══════════════════════════════════════════════════════════════════════════════╗
║                                  INFO                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

Version:    0.0.2
Repository: https://github.com/watany-dev/ccsay
Runtime:    Bun (fast JavaScript runtime)

This tool creates ASCII art using Unicode block characters for a clean,
modern appearance. Perfect for terminal banners, status messages, and adding
visual flair to command-line applications.`;

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
