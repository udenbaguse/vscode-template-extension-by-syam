# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-05-24

### Fixed
- Fixed error merger when one doc .json file is present.


## [1.1.0] - 2026-05-24

### Added
- Use `webpack.config.js`, docs build scripts, and `icon.ico` in generated projects and the npm package file list.
- Pointed generated extension manifests to the webpack output at `out/extension.js`.

## [1.0.1] - 2026-05-09

### Changed
- Updated example.json with improved hover documentation examples

## [1.0.0] - 2026-05-09

### Added
- **CLI Generator**: Interactive command-line tool for scaffolding VS Code extension templates
  - Prompts for extension metadata: name, displayName, description, version, publisher, license
  - Optional repository URL configuration
  - Multi-language activation events selection with checkbox interface
  - Supports 16 languages: JavaScript, TypeScript, JavaScript React, TypeScript React, HTML, CSS, SCSS, JSON, Markdown, Python, PHP, Java, C#, C++, Go, Rust
  - Confirmation prompt before overwriting existing files

- **Generated Extension Files**:
  - `package.json`: Complete VS Code extension manifest with user-provided metadata and activation events
  - `src/extension.js`: Extension entry point with hover provider registration
  - `src/hoverProvider.js`: Reusable hover provider supporting multiple languages
  - `src/docsLoader.js`: JSON-based documentation loader from `src/docs` directory
  - `src/docs/example.json`: Example hover documentation data
  - `.vscode/launch.json`: Debug configuration for Extension Host
  - `.vscodeignore`: Packaging ignore rules for vsce
  - `.gitignore`: Standard Node.js and VS Code extension ignore patterns
  - `LICENSE`: Auto-generated license file (supports MIT and custom licenses)
  - `jsconfig.json`: JavaScript configuration with checkJs enabled
  - `README.md`: Starter documentation template

- **Hover Documentation Features**:
  - Markdown-based hover content with title, description, syntax, and example sections
  - JSON-based documentation storage for easy maintenance
  - Language-aware hover provider that respects activation events
  - Smart detection to avoid showing hover inside strings or comments
