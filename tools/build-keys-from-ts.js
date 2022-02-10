import fs from "fs";
import { alphabetizeKeyInterfaces, getKeysFromTsFile } from "./get-keys-from-ts.js";

const { promises: { writeFile } } = fs;

(async () => {
    const { keys, tsInterfaceDeclarations } = await getKeysFromTsFile("./node_modules/@types/estree/index.d.ts");
    const { keys: jsxKeys } = await getKeysFromTsFile(
        "./node_modules/@types/estree-jsx/index.d.ts",
        {
            supplementaryDeclarations: tsInterfaceDeclarations
        }
    );

    const mergedKeys = alphabetizeKeyInterfaces({ ...keys, ...jsxKeys });

    // eslint-disable-next-line no-console -- CLI
    console.log("keys", mergedKeys);

    writeFile(
        "./lib/visitor-keys.js",
        // eslint-disable-next-line indent -- Readability
`/**
 * @typedef {import('./index.js').KeysStrictReadonly} KeysStrictReadonly
 */

/**
 * @type {KeysStrictReadonly}
 */
const KEYS = ${JSON.stringify(mergedKeys, null, 4).replace(/"(.*?)":/gu, "$1:")};

// Types.
const NODE_TYPES = Object.keys(KEYS);

// Freeze the keys.
for (const type of NODE_TYPES) {
    Object.freeze(KEYS[type]);
}
Object.freeze(KEYS);

export default KEYS;
`
    );

})();
