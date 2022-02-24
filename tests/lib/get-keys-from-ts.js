/**
 * @fileoverview Tests for checking that our build tool can retrieve keys out of TypeScript AST.
 * @author Brett Zamir
 */

import { diffString } from "json-diff";
import { expect } from "chai";
import { alphabetizeKeyInterfaces, getKeysFromTsFile } from "../../tools/get-keys-from-ts.js";
import { KEYS } from "../../lib/index.js";

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

        const backwardCompatibleKeys = {
            ExperimentalRestProperty: [
                "argument"
            ],
            ExperimentalSpreadProperty: [
                "argument"
            ]
        };

        const actual = alphabetizeKeyInterfaces({ ...keys, ...jsxKeys, ...backwardCompatibleKeys });

        const expected = KEYS;

        // eslint-disable-next-line no-console -- Mocha's may drop diffs so show with json-diff
        console.log("JSON Diffs:", diffString(actual, expected) || "(none)");

        expect(actual).to.deep.equal(expected);
    });

    it("sorts keys alphabetically if new", async () => {
        const { keys: actual } = await getKeysFromTsFile(
            "./tests/lib/fixtures/new-keys.d.ts"
        );

        const expected = {
            NewFangledExpression: [
                "down",
                "left",
                "right",
                "up"
            ]
        };

        expect(actual).to.deep.equal(expected);
    });

    it("sorts extra keys at end alphabetically", async () => {
        const { keys: actual } = await getKeysFromTsFile(
            "./tests/lib/fixtures/new-keys-on-old.d.ts"
        );

        const expected = {
            AssignmentExpression: [
                "left",
                "right",
                "down",
                "up"
            ]
        };

        expect(actual).to.deep.equal(expected);
    });
});
