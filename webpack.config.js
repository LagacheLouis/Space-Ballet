const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const APP_DIR = path.resolve(__dirname, 'src');
const BUILD_DIR = path.resolve(__dirname, 'public');
const NODE_ENV = process.env.NODE_ENV;

const config = {
  entry: [`${APP_DIR}/js/index.js`, `${APP_DIR}/scss/styles.scss`],
  output: {
    path: BUILD_DIR,
    filename: 'assets/bundle.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [APP_DIR, 'node_modules'],
    alias: {
      constants: `${APP_DIR}/constants`,
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
        include: APP_DIR,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader",
        ],
    },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "assets/styles.css"
    })
  ],
  devServer: {
    contentBase: BUILD_DIR,
    port: 8080,
    stats: 'minimal',
  },
};

module.exports = config;
