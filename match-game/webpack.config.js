const path = require("path");
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
module.exports = {
  entry: {
    main: path.resolve(__dirname, "./src/index.js"),
  },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.(jpe?g|png|gif)$/i, type: "asset/resourse" },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "bundle"),
    filename: "bundle.js",
  },
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(__dirname, `public`),
    publicPath: `http://localhost:8080/`,
    open: true,
    compress: true,
    hot: true,
    port: 8080,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `./public/index.html`,
      filename: "./index.html",
    }),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ESLintPlugin(),
  ],
  mode: `production`,
};
