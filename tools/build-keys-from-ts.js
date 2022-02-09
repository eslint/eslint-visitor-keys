import { alphabetizeKeyInterfaces, getKeysFromTsFile } from "./get-keys-from-ts.js";

(async () => {
    const { keys, tsInterfaceDeclarations } = await getKeysFromTsFile("./node_modules/@types/estree/index.d.ts");
    const { keys: jsxKeys } = await getKeysFromTsFile(
        "./node_modules/@types/estree-jsx/index.d.ts",
        {
            supplementaryDeclarations: tsInterfaceDeclarations
        }
    );

    // eslint-disable-next-line no-console -- CLI
    console.log("keys", alphabetizeKeyInterfaces({ ...keys, ...jsxKeys }));
})();
