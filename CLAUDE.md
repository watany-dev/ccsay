# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccsay is a joke CLI tool that displays text in ASCII art similar to cowsay. It renders text using block-style Unicode characters in orange color (ANSI escape code). By default, it displays "CLAUDE CODE" but accepts custom text as command-line arguments.

## Development Setup

This project uses Bun as the JavaScript runtime. Ensure Bun is installed:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

## Common Commands

```bash
# Install dependencies
bun install

# Run in development
bun run dev
bun run src/index.ts "YOUR TEXT"

# Run tests
bun test
bun test --watch

# Lint and format
bun run lint          # Check for issues
bun run lint:fix      # Fix auto-fixable issues
bun run format        # Format code

# Build standalone binary
bun run build         # Creates bin/ccsay-standalone
```

## Project Structure

```
ccsay/
├── src/
│   ├── index.ts      # CLI entry point
│   └── fonts.ts      # ASCII art font definitions
├── test/
│   └── fonts.test.ts # Unit tests
├── bin/
│   ├── ccsay         # Bun-based executable
│   └── ccsay-standalone # Compiled binary
├── biome.json        # Formatter/linter config
├── vitest.config.ts  # Test runner config
└── package.json      # Project configuration
```

## Technology Stack

- **Runtime**: Bun (fast JavaScript runtime)
- **Language**: TypeScript
- **Formatter/Linter**: Biome (fast, unified toolchain)
- **Test Runner**: Vitest
- **Build**: Bun's built-in compiler for standalone executables

## Architecture

The project consists of two main modules:
1. `fonts.ts`: Contains the BLOCK_FONT dictionary mapping characters to 6-line ASCII art arrays
2. `index.ts`: CLI interface that processes arguments and outputs colored ASCII art

## Testing

Tests are written using Vitest and cover:
- Font character availability (A-Z, 0-9, punctuation)
- Text-to-ASCII conversion logic
- Edge cases (empty strings, unknown characters)