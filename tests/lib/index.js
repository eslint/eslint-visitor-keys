/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
"use strict";

const assert = require("assert");
const fs = require("fs");
const evk = require("../..");

const keys = JSON.parse(fs.readFileSync("lib/visitor-keys.json", "utf8"));

describe("eslint-visitor-keys", () => {
    describe("KEYS", () => {
        it("should be same as lib/visitor-keys.json", () => {
            assert.deepStrictEqual(evk.KEYS, keys);
        });
    });

    describe("getKeys()", () => {
        it("should return keys", () => {
            assert.deepStrictEqual(evk.getKeys({ a: 1, b: 2 }), ["a", "b"]);
        });

        it("should not include 'parent' in the result", () => {
            assert.deepStrictEqual(evk.getKeys({ a: 1, b: 2, parent: 3 }), ["a", "b"]);
        });

        it("should not include 'leadingComments' in the result", () => {
            assert.deepStrictEqual(evk.getKeys({ a: 1, b: 2, leadingComments: 3 }), ["a", "b"]);
        });

        it("should not include 'trailingComments' in the result", () => {
            assert.deepStrictEqual(evk.getKeys({ a: 1, b: 2, trailingComments: 3 }), ["a", "b"]);
        });

        it("should not include '_foo' in the result", () => {
            assert.deepStrictEqual(evk.getKeys({ a: 1, b: 2, _foo: 3 }), ["a", "b"]);
        });
    });

    describe("unionWith()", () => {
        const additionalKeys = { Program: ["body", "a"], AssignmentExpression: ["b"], additional: ["c"] };
        const unionKeys = evk.unionWith(additionalKeys);

        it("should include all keys of lib/visitor-keys.json", () => {
            for (const type of Object.keys(keys)) {
                for (const key of keys[type]) {
                    assert(unionKeys[type].indexOf(key) !== -1, `'${key}' should be included in '${type}'.`);
                }
            }
        });

        it("should include all additional keys", () => {
            for (const type of Object.keys(additionalKeys)) {
                for (const key of additionalKeys[type]) {
                    assert(unionKeys[type].indexOf(key) !== -1, `'${key}' should be included in '${type}'.`);
                }
            }
        });

        it("should not have duplicate", () => {
            assert(unionKeys.Program.filter(key => key === "body").length === 1);
        });
    });
});
