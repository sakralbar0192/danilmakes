const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const demoRoot = __dirname;
const divisionsRoot = path.resolve(demoRoot, "../../../Divisions");
const sourcePath = path.resolve(divisionsRoot, "source");

module.exports = {
  mode: "production",
  entry: path.resolve(demoRoot, "src/main.ts"),
  output: {
    path: path.resolve(demoRoot, "dist"),
    filename: "assets/[name].[contenthash].js",
    publicPath: "/divisions/",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: [path.resolve(demoRoot, "node_modules"), sourcePath],
    alias: {
      lit: path.resolve(demoRoot, "node_modules/lit"),
      "lit-html": path.resolve(demoRoot, "node_modules/lit-html"),
      "xlsx-js-style": path.resolve(demoRoot, "src/shims/xlsx-js-style.ts"),
      "shared/helpers/defineCoreHost": path.resolve(demoRoot, "src/shims/defineCoreHost.ts"),
      "shared/helpers/serverRequests/requestFromServer": path.resolve(demoRoot, "src/shims/requestFromServer.ts"),
    },
  },
  resolveLoader: {
    modules: [path.resolve(demoRoot, "node_modules")],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.resolve(demoRoot, "tsconfig.webpack.json"),
            transpileOnly: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.lit\.scss$/,
        use: [
          { loader: "lit-scss-loader", options: { minify: true } },
          "extract-loader",
          { loader: "css-loader", options: { esModule: false } },
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        loader: "lit-svg-loader",
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEMO_BASE__: JSON.stringify("/divisions/"),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(demoRoot, "index.html"),
      inject: "body",
      scriptLoading: "module",
    }),
  ],
  devtool: false,
};
