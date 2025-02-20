import CopyWebpackPlugin from "copy-webpack-plugin";
import { glob } from "glob";
import path from "path";
import type { Configuration } from "webpack";

const testFilePaths = glob.sync("./src/test/**/*.test.ts");

const testConfig: Configuration = {
  name: "test",
  target: "node",
  mode: "none",

  entry: Object.fromEntries(
    testFilePaths.map((testFilePath) => [
      testFilePath.replace("src/test/", "").replace(".ts", ""),
      path.resolve(__dirname, testFilePath),
    ])
  ),

  output: {
    path: path.resolve(__dirname, "dist-tests"),
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },

  externals: {
    vscode: "commonjs vscode",
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/test/validSamples", to: "validSamples" },
        { from: "src/test/invalidSamples", to: "invalidSamples" },
      ],
    }),
  ],
  devtool: "nosources-source-map",
};

export default testConfig;
