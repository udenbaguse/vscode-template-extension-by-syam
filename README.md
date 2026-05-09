# VS Code Template Extension by Syam

A CLI generator for creating reusable VS Code extension templates. Run it with `npx`, answer a few prompts, and it will scaffold a ready-to-edit extension project in the current directory.

## Usage

```bash
npx vscode-template-extension-by-syam
```

For local development:

```bash
npm start
```

The CLI asks for:

```text
name (my-vscode-extension):
displayName (My Vscode Extension):
description (A reusable template for building a VS Code extension.):
version (0.0.1):
publisher (your-publisher-name):
license (MIT):
repositoryUrl (optional, press Enter to skip):
```

After that, the CLI opens an activation events checkbox. Use the arrow keys to move, Space to toggle a language, and Enter to confirm.

## Generated Files

The generator creates a complete VS Code extension template:

- `package.json`: extension metadata from your prompt answers.
- `src/extension.js`: extension entry point with selected languages.
- `src/hoverProvider.js`: reusable hover provider.
- `src/docsLoader.js`: JSON documentation loader.
- `src/docs/example.json`: example hover documentation data.
- `.vscode/launch.json`: Extension Host debug configuration.
- `.vscodeignore`: packaging ignore rules.
- `.gitignore`: Git ignore rules for Node and VS Code extension output.
- `LICENSE`: license file generated from the selected license value.
- `jsconfig.json`: JavaScript configuration with `checkJs`.
- `README.md`: starter documentation for the generated extension.

If any generated file already exists, the CLI asks for confirmation before overwriting it.

## Generated package.json

The generated `package.json` includes:

- `name`, `displayName`, `description`, `version`, `publisher`, and `license`.
- optional `repository` when `repositoryUrl` is provided.
- `engines.vscode` with the default `^1.85.0`.
- `activationEvents` from the selected checkbox languages.
- `main` set to `./src/extension.js`.
- `check`, `test`, and `package` scripts.
- `@types/vscode` and `@vscode/vsce` as development dependencies.

## Hover Data

Add or edit JSON files inside `src/docs`.

```json
{
  "keyword": {
    "title": "Hover title",
    "description": "A short explanation.",
    "syntax": "keyword(value)",
    "example": "keyword(\"example\");"
  }
}
```

The key, such as `keyword`, is the editor text that triggers the hover.

## Validation

```bash
npm run check
```
