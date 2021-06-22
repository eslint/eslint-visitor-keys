export default {
    input: "./lib/index.js",
    external: ["fs"],
    treeshake: false,
    output: {
        exports: "default",
        format: "cjs",
        file: "dist/eslint-visitor-keys.cjs",
        sourcemap: true
    }
};
