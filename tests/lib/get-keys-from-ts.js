import { diffString } from "json-diff";
import chai, { expect } from "chai";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { alphabetizeKeyInterfaces, getKeysFromTsFile } from "../../tools/get-keys-from-ts.js";
import { KEYS } from "../../lib/index.js";

chai.use(deepEqualInAnyOrder);

describe("getKeysFromTsFile", () => {
    it("gets keys", async () => {
        const { keys, tsInterfaceDeclarations } = await getKeysFromTsFile(
            "./node_modules/@types/estree/index.d.ts"
        );
        const { keys: jsxKeys } = await getKeysFromTsFile(
            "./node_modules/@types/estree-jsx/index.d.ts",
            {
                supplementaryDeclarations: tsInterfaceDeclarations
            }
        );

        /**
         * Alphabetizes the keys of the interface-keys object
         * @param {KeysStrict} keysObj The interface-keys object to sort
         * @returns {KeysStrict} The alphabetized keys
         */
        function alphabetizeKeys(keysObj) {
            const retObj = {};

            for (const [interfaceName, keysArr] of Object.entries(keysObj)) {
                retObj[interfaceName] = [...keysArr].sort();
            }
            return retObj;
        }

        const actual = alphabetizeKeys(alphabetizeKeyInterfaces({ ...keys, ...jsxKeys }));

        const expected = alphabetizeKeys(KEYS);

        console.log(diffString(actual, expected));

        expect(actual).to.deep.equal(expected);
    });
});
