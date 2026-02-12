# Font Manager

A simple and elegant Font Manager built with Wails (Go + React).

## Features

- **Browse System Fonts**: Automatically detects and lists all installed fonts on your system.
- **Live Preview**: Type your own text to see how it looks in any font instantly.
- **Search**: Quickly find fonts by name.
- **Size Control**: Adjust the preview size with a slider.
- **Dark Mode**: Comes with a sleek dark theme for comfortable viewing.

## Prerequisites

- [Go](https://go.dev/) 1.18+
- [Node.js](https://nodejs.org/) 16+
- [Wails](https://wails.io/) CLI

## Installation

1. Clone the repository.
2. Open terminal in the project directory.
3. Run `wails build` to create the application executable.

## Usage

### Development

To run in development mode with live reload:

```bash
wails dev
```

### Production Build

To build distinct binaries for distribution:

```bash
wails build
```

The executable will be located in `build/bin/`.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
