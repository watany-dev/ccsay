# ccsay

A joke CLI tool that displays text in ASCII art, similar to cowsay but with block-style Unicode characters in orange color.

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ccsay.git
cd ccsay

# Install dependencies
bun install

# Install globally
bun link
```

## Usage

```bash
# Display default message
ccsay

# Display custom text
ccsay Hello World

# Using the standalone binary
./bin/ccsay-standalone "Your Text Here"
```

## Development

This project uses:
- **Bun** - Fast JavaScript runtime
- **Biome** - Formatter and linter
- **Vitest** - Test runner

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions.

## License

Apache License 2.0