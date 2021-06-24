export default {
    input: "./lib/index.js",
    treeshake: false,
    output: {
        format: "cjs",
        file: "dist/eslint-visitor-keys.cjs",
        sourcemap: true
    }
};
