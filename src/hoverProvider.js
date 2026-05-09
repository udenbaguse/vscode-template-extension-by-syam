const vscode = require("vscode");
const loadDocs = require("./docsLoader");

const DEFAULT_LANGUAGES = ["javascript", "typescript"];
const docs = loadDocs();

/**
 * Buat tampilan Markdown untuk hover.
 *
 * @param {{ title: string, description: string, syntax?: string, example?: string }} doc
 */
function createMarkdown(doc) {
  const markdown = new vscode.MarkdownString();

  markdown.appendMarkdown(`## ${doc.title}\n\n`);
  markdown.appendMarkdown(`${doc.description}\n\n`);

  if (doc.syntax) {
    markdown.appendMarkdown("### Syntax\n");
    markdown.appendCodeblock(doc.syntax, "js");
  }

  if (doc.example) {
    markdown.appendMarkdown("### Contoh\n");
    markdown.appendCodeblock(doc.example, "js");
  }

  return markdown;
}

/**
 * Hindari hover aktif di dalam string atau comment sederhana.
 *
 * @param {import('vscode').TextDocument} document
 * @param {import('vscode').Position} position
 */
function isInsideStringOrComment(document, position) {
  const textBeforePosition = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position),
  );
  let state = null;

  for (let index = 0; index < textBeforePosition.length; index++) {
    const char = textBeforePosition[index];
    const next = textBeforePosition[index + 1];

    if (state === "lineComment") {
      if (char === "\n" || char === "\r") state = null;
      continue;
    }

    if (state === "blockComment") {
      if (char === "*" && next === "/") {
        state = null;
        index++;
      }
      continue;
    }

    if (state) {
      if (char === "\\") {
        index++;
        continue;
      }

      if (char === state) state = null;
      continue;
    }

    if (char === "/" && next === "/") {
      state = "lineComment";
      index++;
      continue;
    }

    if (char === "/" && next === "*") {
      state = "blockComment";
      index++;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      state = char;
    }
  }

  return Boolean(state);
}

/**
 * Buat hover provider reusable.
 *
 * Data hover dibaca dari file JSON di folder src/docs.
 * Key JSON harus sama dengan kata yang akan diberi hover.
 *
 * @param {{ languages?: string[] }} [options]
 */
function createHoverProvider(options = {}) {
  const languages = options.languages || DEFAULT_LANGUAGES;

  return vscode.languages.registerHoverProvider(languages, {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) return null;

      if (isInsideStringOrComment(document, range.start)) return null;

      const word = document.getText(range);
      const doc = docs[word];

      if (!doc) return null;

      return new vscode.Hover(createMarkdown(doc), range);
    },
  });
}

module.exports = createHoverProvider;
