#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const LANGUAGE_OPTIONS = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascriptreact", label: "JavaScript React" },
  { id: "typescriptreact", label: "TypeScript React" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "python", label: "Python" },
  { id: "php", label: "PHP" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

const DEFAULT_NAME = "my-vscode-extension";
const DEFAULT_DESCRIPTION =
  "A reusable template for building a VS Code extension.";
const DEFAULT_VERSION = "0.0.1";
const DEFAULT_PUBLISHER = "your-publisher-name";
const DEFAULT_LICENSE = "MIT";
const DEFAULT_LANGUAGE_IDS = ["javascript", "typescript"];

function getDefaultLanguageSelection() {
  return DEFAULT_LANGUAGE_IDS.map((languageId) => {
    return LANGUAGE_OPTIONS.findIndex((option) => option.id === languageId) + 1;
  })
    .filter((index) => index > 0)
    .join(",");
}

function createPromptSession() {
  if (!process.stdin.isTTY) {
    const answers = fs.readFileSync(0, "utf8").split(/\r?\n/);

    return {
      question(question, callback) {
        process.stdout.write(`${question}\n`);
        callback(answers.length > 0 ? answers.shift() : "");
      },
      close() {},
    };
  }

  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function askWithDefault(rl, label, defaultValue) {
  const answer = await ask(rl, `${label} (${defaultValue}): `);
  return answer || defaultValue;
}

async function askOptional(rl, label) {
  return ask(rl, `${label} (optional, press Enter to skip): `);
}

function toDisplayName(packageName) {
  return packageName
    .replace(/^@[^/]+\//, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderLanguageOptions() {
  return LANGUAGE_OPTIONS.map((option, index) => {
    const number = String(index + 1).padStart(2, " ");
    return `  ${number}. ${option.label} (${option.id})`;
  }).join("\n");
}

function parseLanguageSelection(input) {
  const rawSelection = input || getDefaultLanguageSelection();
  const selectedIds = [];

  for (const value of rawSelection.split(",")) {
    const token = value.trim();
    if (!token) continue;

    const optionByNumber = Number(token);
    const option =
      Number.isInteger(optionByNumber) && optionByNumber > 0
        ? LANGUAGE_OPTIONS[optionByNumber - 1]
        : LANGUAGE_OPTIONS.find((language) => {
            const normalizedToken = token
              .replace(/^onLanguage:/i, "")
              .toLowerCase();

            return (
              language.id.toLowerCase() === normalizedToken ||
              language.label.toLowerCase() === normalizedToken
            );
          });

    if (option && !selectedIds.includes(option.id)) {
      selectedIds.push(option.id);
    }
  }

  return selectedIds;
}

async function askActivationEvents(rl) {
  if (process.stdin.isTTY) {
    return askActivationEventsWithCheckbox(rl);
  }

  console.log("\nSelect languages for activationEvents.");
  console.log("You can choose more than one. Separate values with commas.");
  console.log(renderLanguageOptions());

  while (true) {
    const answer = await ask(
      rl,
      `activationEvents (${getDefaultLanguageSelection()}): `,
    );
    const selectedLanguageIds = parseLanguageSelection(answer);

    if (selectedLanguageIds.length > 0) {
      return selectedLanguageIds.map((languageId) => `onLanguage:${languageId}`);
    }

    console.log("Invalid selection. Example: 1,2,5 or javascript,typescript");
  }
}

function renderCheckboxState(cursorIndex, selectedIds, message = "") {
  const lines = [
    "Select activationEvents",
    "Use Up/Down to move, Space to toggle, Enter to confirm.",
    "",
    ...LANGUAGE_OPTIONS.map((option, index) => {
      const cursor = index === cursorIndex ? ">" : " ";
      const checked = selectedIds.includes(option.id) ? "x" : " ";
      return `${cursor} [${checked}] ${option.label} (${option.id})`;
    }),
    "",
    `Selected: ${selectedIds.length > 0 ? selectedIds.join(", ") : "none"}`,
  ];

  if (message) {
    lines.push(message);
  }

  return lines;
}

async function askActivationEventsWithCheckbox(rl) {
  if (typeof rl.pause === "function") {
    rl.pause();
  }

  return new Promise((resolve) => {
    let cursorIndex = 0;
    let selectedIds = [...DEFAULT_LANGUAGE_IDS];
    let renderedLines = 0;
    let message = "";

    function cleanup() {
      process.stdin.setRawMode(false);
      process.stdin.off("keypress", handleKeypress);
      if (typeof rl.resume === "function") {
        rl.resume();
      }
    }

    function render() {
      if (renderedLines > 0) {
        readline.moveCursor(process.stdout, 0, -renderedLines);
      }

      readline.cursorTo(process.stdout, 0);
      readline.clearScreenDown(process.stdout);

      const lines = renderCheckboxState(cursorIndex, selectedIds, message);
      process.stdout.write(`${lines.join("\n")}\n`);
      renderedLines = lines.length;
    }

    function toggleSelected() {
      const languageId = LANGUAGE_OPTIONS[cursorIndex].id;

      if (selectedIds.includes(languageId)) {
        selectedIds = selectedIds.filter((id) => id !== languageId);
      } else {
        selectedIds.push(languageId);
      }
    }

    function handleKeypress(_, key) {
      message = "";

      if (key.ctrl && key.name === "c") {
        cleanup();
        process.stdout.write("\n");
        process.exit(130);
      }

      if (key.name === "up" || key.name === "k") {
        cursorIndex =
          cursorIndex === 0 ? LANGUAGE_OPTIONS.length - 1 : cursorIndex - 1;
        render();
        return;
      }

      if (key.name === "down" || key.name === "j") {
        cursorIndex =
          cursorIndex === LANGUAGE_OPTIONS.length - 1 ? 0 : cursorIndex + 1;
        render();
        return;
      }

      if (key.name === "space") {
        toggleSelected();
        render();
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        if (selectedIds.length === 0) {
          message = "Choose at least one language.";
          render();
          return;
        }

        cleanup();
        process.stdout.write("\n");
        resolve(selectedIds.map((languageId) => `onLanguage:${languageId}`));
      }
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("keypress", handleKeypress);

    process.stdout.write("\n");
    render();
  });
}

function createPackageJson(answers) {
  return {
    name: answers.name,
    displayName: answers.displayName,
    description: answers.description,
    version: answers.version,
    icon: "icon.ico",
    publisher: answers.publisher,
    license: answers.license,
    ...(answers.repositoryUrl
      ? {
          repository: {
            type: "git",
            url: answers.repositoryUrl,
          },
        }
      : {}),
    engines: {
      vscode: "^1.85.0",
    },
    categories: ["Other"],
    activationEvents: answers.activationEvents,
    main: "./out/extension.js",
    contributes: {},
    scripts: {
      check:
        "node --check src/extension.js && node --check src/hoverProvider.js && node --check src/docsLoader.js",
      test: "npm run check",
      "merge-docs": "node scripts/merge-docs.js",
      "minify-docs": "node scripts/minify-docs.js",
      compile: "npm run merge-docs && npm run minify-docs && webpack --mode production",
      package: "npm run compile && vsce package",
    },
    devDependencies: {
      "@types/vscode": "^1.85.0",
      "@vscode/vsce": "^3.6.0",
      "copy-webpack-plugin": "^12.0.0",
      esbuild: "^0.28.0",
      webpack: "^5.90.0",
      "webpack-cli": "^5.1.0",
    },
  };
}

function getLanguageIds(activationEvents) {
  return activationEvents.map((activationEvent) => {
    return activationEvent.replace(/^onLanguage:/, "");
  });
}

function readBundledFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

function readBundledBinaryFile(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath));
}

function createExtensionJs(answers, languageIds) {
  return `const createHoverProvider = require("./hoverProvider");

/**
 * Entry point when the extension is activated.
 *
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
  const hoverProvider = createHoverProvider({
    languages: ${JSON.stringify(languageIds, null, 4)},
  });

  context.subscriptions.push(hoverProvider);

  console.log(${JSON.stringify(`${answers.displayName} is active.`)});
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
`;
}

function createHoverProviderJs(languageIds) {
  return readBundledFile("src/hoverProvider.js").replace(
    'const DEFAULT_LANGUAGES = ["javascript", "typescript"];',
    `const DEFAULT_LANGUAGES = ${JSON.stringify(languageIds)};`,
  );
}

function createLaunchJson() {
  return `${JSON.stringify(
    {
      version: "0.2.0",
      configurations: [
        {
          name: "Run Extension",
          type: "extensionHost",
          request: "launch",
          preLaunchTask: "npm: compile",
          args: ["--extensionDevelopmentPath=${workspaceFolder}"],
          outFiles: ["${workspaceFolder}/out/**/*.js"],
        },
      ],
    },
    null,
    2,
  )}\n`;
}

function createReadme(answers, languageIds) {
  return `# ${answers.displayName}

${answers.description}
${answers.repositoryUrl ? `\nRepository: ${answers.repositoryUrl}\n` : ""}
## Features

- Simple hover documentation for VS Code.
- Hover content is stored as JSON in \`src/docs\`.
- Active languages: ${languageIds.map((languageId) => `\`${languageId}\``).join(", ")}.

## Structure

- \`src/extension.js\`: extension entry point.
- \`src/hoverProvider.js\`: reusable hover provider.
- \`src/docsLoader.js\`: JSON documentation loader.
- \`src/docs/example.json\`: example documentation data.
- \`webpack.config.js\`: production bundle configuration.
- \`scripts/merge-docs.js\`: merges JSON hover docs before bundling.
- \`scripts/minify-docs.js\`: creates the minified docs file used by webpack.

## Running

\`\`\`bash
npm install
npm run compile
\`\`\`

Open this folder in VS Code, press \`F5\`, and choose the **Run Extension** configuration.
The launch configuration also runs \`npm: compile\` before starting the Extension Host.

## Adding Hover Data

Add a new key to any JSON file inside \`src/docs\`.

\`\`\`json
{
  "keyword": {
    "title": "Hover title",
    "description": "A short explanation.",
    "syntax": "keyword(value)",
    "example": "keyword(\\"example\\");"
  }
}
\`\`\`

The key, such as \`keyword\`, is the editor text that triggers the hover.

## Validation

\`\`\`bash
npm run check
\`\`\`

## Packaging

\`\`\`bash
npm run package
\`\`\`
`;
}

function createGitignore() {
  return `node_modules/
.vscode-test/
out/
dist/
*.vsix
debug.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
`;
}

function getCopyrightHolder(answers) {
  if (answers.publisher && answers.publisher !== DEFAULT_PUBLISHER) {
    return answers.publisher;
  }

  return answers.displayName;
}

function createLicense(answers) {
  const year = new Date().getFullYear();
  const holder = getCopyrightHolder(answers);

  if (answers.license.trim().toUpperCase() === "MIT") {
    return `MIT License

Copyright (c) ${year} ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
  }

  return `${answers.license}

Copyright (c) ${year} ${holder}

This project declares the ${answers.license} license in package.json.
Replace this file with the full license text that matches your project before publishing.
`;
}

function createProjectFiles(answers) {
  const languageIds = getLanguageIds(answers.activationEvents);

  return [
    {
      relativePath: "package.json",
      content: `${JSON.stringify(createPackageJson(answers), null, 2)}\n`,
    },
    {
      relativePath: "icon.ico",
      content: readBundledBinaryFile("icon.ico"),
    },
    {
      relativePath: "jsconfig.json",
      content: readBundledFile("jsconfig.json"),
    },
    {
      relativePath: ".vscodeignore",
      content: readBundledFile(".vscodeignore"),
    },
    {
      relativePath: ".gitignore",
      content: createGitignore(),
    },
    {
      relativePath: "webpack.config.js",
      content: readBundledFile("webpack.config.js"),
    },
    {
      relativePath: "scripts/merge-docs.js",
      content: readBundledFile("scripts/merge-docs.js"),
    },
    {
      relativePath: "scripts/minify-docs.js",
      content: readBundledFile("scripts/minify-docs.js"),
    },
    {
      relativePath: "LICENSE",
      content: createLicense(answers),
    },
    {
      relativePath: ".vscode/launch.json",
      content: createLaunchJson(),
    },
    {
      relativePath: "src/extension.js",
      content: createExtensionJs(answers, languageIds),
    },
    {
      relativePath: "src/hoverProvider.js",
      content: createHoverProviderJs(languageIds),
    },
    {
      relativePath: "src/docsLoader.js",
      content: readBundledFile("src/docsLoader.js"),
    },
    {
      relativePath: "src/docs/example.json",
      content: readBundledFile("src/docs/example.json"),
    },
    {
      relativePath: "README.md",
      content: createReadme(answers, languageIds),
    },
  ];
}

async function confirmOverwrite(rl, projectFiles) {
  const existingFiles = projectFiles.filter((file) => {
    return fs.existsSync(path.join(process.cwd(), file.relativePath));
  });

  if (existingFiles.length === 0) return true;

  console.log("\nThe following files already exist:");
  for (const file of existingFiles) {
    console.log(`- ${file.relativePath}`);
  }

  const answer = await ask(
    rl,
    "Overwrite these files and continue creating the template? (y/N): ",
  );

  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

function writeProjectFiles(projectFiles) {
  for (const file of projectFiles) {
    const outputPath = path.join(process.cwd(), file.relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, file.content);
  }
}

async function main() {
  const rl = createPromptSession();

  try {
    console.log("Create a VS Code extension template\n");

    const name = await askWithDefault(rl, "name", DEFAULT_NAME);
    const displayName = await askWithDefault(
      rl,
      "displayName",
      toDisplayName(name),
    );
    const description = await askWithDefault(
      rl,
      "description",
      DEFAULT_DESCRIPTION,
    );
    const version = await askWithDefault(rl, "version", DEFAULT_VERSION);
    const publisher = await askWithDefault(rl, "publisher", DEFAULT_PUBLISHER);
    const license = await askWithDefault(rl, "license", DEFAULT_LICENSE);
    const repositoryUrl = await askOptional(rl, "repositoryUrl");
    const activationEvents = await askActivationEvents(rl);
    const projectFiles = createProjectFiles({
      name,
      displayName,
      description,
      version,
      publisher,
      license,
      repositoryUrl,
      activationEvents,
    });

    const shouldWrite = await confirmOverwrite(rl, projectFiles);

    if (!shouldWrite) {
      console.log("\nCancelled. No files were changed.");
      return;
    }

    writeProjectFiles(projectFiles);

    console.log(`\nDone. VS Code template created in ${process.cwd()}`);
    console.log("Next steps:");
    console.log("1. npm install");
    console.log("2. Open this folder in VS Code");
    console.log("3. Press F5 to run the Extension Host");
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
