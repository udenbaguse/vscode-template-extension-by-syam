const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  target: "node",
  entry: "./src/extension.js",
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    clean: true,
  },
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/docs/docs.min.json",
          to: "docs/docs.json",
        },
      ],
    }),
  ],
};
