import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import type { Configuration } from "webpack";

const testConfig: Configuration = {
  name: "test",
  target: "node",
  mode: "none",

  entry: "./src/test/parseAllRegions.test.ts",

  output: {
    path: path.resolve(__dirname, "dist/src/test"),
    filename: "parseAllRegions.test.js",
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
      patterns: [{ from: "src/test/samples", to: "samples" }],
    }),
  ],
  devtool: "nosources-source-map",
};

export default testConfig;
