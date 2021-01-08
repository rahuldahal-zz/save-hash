const path = require("path");

const common = {
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};

const fooConfig = Object.assign(common, {
  name: "popup",
  entry: "./popup/popup.dev.js",
  output: {
    path: path.resolve(__dirname, "popup"),
    filename: "popup.js",
  },
});
const barConfig = Object.assign(common, {
  name: "saveHash",
  entry: "./saveHash.dev.js",
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "./saveHash.js",
  },
});

// Return Array of Configurations
module.exports = [fooConfig, barConfig];
