const path = require("path");

var fooConfig = {
  name: "popup",
  entry: "./popup/popup.dev.js",
  output: {
    path: path.resolve(__dirname, "popup"),
    filename: "popup.js",
  },
};
var barConfig = {
  name: "saveHash",
  entry: "./saveHash.dev.js",
  output: {
    path: path.resolve(__dirname, "./"),
    filename: "./saveHash.js",
  },
};

// Return Array of Configurations
module.exports = [fooConfig, barConfig];
