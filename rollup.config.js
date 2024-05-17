import dts from "rollup-plugin-dts";

export default [
    {
        input: "./lib/index.js",
        treeshake: false,
        output: {
            format: "cjs",
            file: "dist/eslint-visitor-keys.cjs",
            sourcemap: true,
            sourcemapExcludeSources: true
        }
    },
    {
        plugins: [dts()],
        input: "./lib/index.js",
        treeshake: false,
        output: {
            format: "cjs",
            file: "dist/eslint-visitor-keys.d.cts"
        }
    }
];
