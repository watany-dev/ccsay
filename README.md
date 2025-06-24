# ccsay

A fun CLI tool that displays text in colorful ASCII art, inspired by the classic `cowsay` command. Perfect for adding some flair to your terminal output!

```
 ██████╗ ██████╗ ███████╗ █████╗ ██╗   ██╗
██╔════╝██╔════╝██╔════╝██╔══██╗╚██╗ ██╔╝
██║     ██║     ███████╗███████║ ╚████╔╝ 
██║     ██║     ╚════██║██╔══██║  ╚██╔╝  
╚██████╗╚██████╗███████║██║  ██║   ██║   
 ╚═════╝ ╚═════╝╚══════╝╚═╝  ╚═╝   ╚═╝   
```

## Features

- 🎨 **Colorful Output**: Text is displayed in vibrant orange color
- 📝 **Block-style ASCII Art**: Uses Unicode block characters for crisp, modern look
- 🔤 **Full Character Support**: Supports A-Z, 0-9, and common punctuation
- 📄 **Multi-line Support**: Handle newlines with `\n` sequences
- ⚡ **Fast**: Built with Bun for lightning-fast performance
- 📦 **Standalone Binary**: No dependencies required after installation

## Installation

### Option 1: Download Pre-built Binary (Recommended)

1. Go to the [Releases page](https://github.com/watany-dev/ccsay/releases)
2. Download the `ccsay` binary for your system
3. Make it executable and move to your PATH:

```bash
# Make executable
chmod +x ccsay

# Move to PATH (optional)
sudo mv ccsay /usr/local/bin/ccsay
```

### Option 2: Build from Source

Requirements: [Bun](https://bun.sh) runtime

```bash
# Clone the repository
git clone https://github.com/your-username/ccsay.git
cd ccsay

# Install dependencies
bun install

# Build standalone binary
bun run build

# The binary will be available at ./bin/ccsay
```

### Option 3: Install with Bun

```bash
# Install globally with Bun
bun install -g ccsay

# Or run directly
bunx ccsay "Hello World"
```

## Usage

### Basic Usage

```bash
# Display default text
ccsay

# Display custom text
ccsay "Hello World"

# Multiple words
ccsay "This is awesome"

# Show help
ccsay --help
ccsay -h
```

### Color Options

```bash
# Default orange color
ccsay "Hello World"

# Red text
ccsay -c red "ERROR"
ccsay --color red "ERROR"

# Available colors: black, red, green, yellow, blue, magenta, cyan, white, orange, purple, pink, gray, grey
ccsay -c blue "BUILDING..."
```

### Multi-line Text

```bash
# Using \n for newlines
ccsay "Line 1\nLine 2"

# Separate arguments with \n
ccsay "First Line" \ n "Second Line"
```

### Examples

**Simple greeting:**
```bash
ccsay "HELLO"
```

Output:
```
██╗  ██╗███████╗██╗     ██╗      ██████╗ 
██║  ██║██╔════╝██║     ██║     ██╔═══██╗
███████║█████╗  ██║     ██║     ██║   ██║
██╔══██║██╔══╝  ██║     ██║     ██║   ██║
██║  ██║███████╗███████╗███████╗╚██████╔╝
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝ ╚═════╝ 
```

**Multi-line message:**
```bash
ccsay "HELLO\nWORLD"
```

**Numbers and symbols:**
```bash
ccsay "2024!"
```

## Character Support

- **Letters**: A-Z (automatically converted to uppercase)
- **Numbers**: 0-9
- **Punctuation**: Space, !, ?, ., , (comma), - (hyphen)
- **Special**: Newline support with `\n`

## Use Cases

- 🎉 **Terminal Banners**: Create eye-catching headers for your scripts
- 📝 **Status Messages**: Make important messages stand out
- 🎮 **Fun Commands**: Add personality to your CLI tools
- 📚 **Documentation**: Create ASCII art for README files
- 🎯 **Presentations**: Terminal-based presentations with style

## Integration Examples

### In Shell Scripts

```bash
#!/bin/bash
ccsay "DEPLOY STARTED"
# Your deployment commands here
ccsay "DEPLOY COMPLETE"
```

### In CI/CD Pipelines

```yaml
# GitHub Actions example
- name: Build Success
  run: ccsay "BUILD SUCCESS"
```

### As a Login Banner

Add to your `.bashrc` or `.zshrc`:
```bash
ccsay "WELCOME BACK"
```

## Development

Want to contribute? Great!

```bash
# Clone and setup
git clone https://github.com/your-username/ccsay.git
cd ccsay
bun install

# Run in development mode
bun run dev "Your Text"

# Run tests
bun test

# Lint code
bun run lint

# Build
bun run build
```

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Language**: TypeScript
- **Formatter/Linter**: [Biome](https://biomejs.dev) - Fast, unified toolchain
- **Testing**: [Vitest](https://vitest.dev) - Fast unit testing
- **CI/CD**: GitHub Actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic `cowsay` command
- Built with love for the terminal community
- Special thanks to all contributors

---

**Made with ❤️ for terminal enthusiasts everywhere!**