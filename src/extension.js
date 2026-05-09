const createHoverProvider = require("./hoverProvider");

/**
 * Entry point saat extension aktif.
 *
 * @param {import('vscode').ExtensionContext} context
 */
function activate(context) {
  const hoverProvider = createHoverProvider({
    languages: ["javascript", "typescript"],
  });

  context.subscriptions.push(hoverProvider);

  console.log("VS Code Template Extension aktif.");
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
