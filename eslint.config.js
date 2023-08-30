import eslintConfigESLint from "eslint-config-eslint";
import globals from "globals";

export default [
    {
        ignores: [
            "dist/",
            "coverage/"
        ]
    },
    ...eslintConfigESLint,
    {
        settings: {
            jsdoc: {
                preferredTypes: {
                    Object: "object",
                    "object<>": "Object"
                }
            }
        }
    },
    {
        files: ["tests/lib/**"],
        languageOptions: {
            globals: {
                ...globals.mocha
            }
        }
    }
];
