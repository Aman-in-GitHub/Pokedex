module.exports = {
  extends: ["expo"],
  plugins: ["@tanstack/query", "eslint-plugin-react-compiler"],
  rules: {
    "react-compiler/react-compiler": "error",
    "@tanstack/query/exhaustive-deps": "error",
  },
};
