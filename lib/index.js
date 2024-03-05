/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import KEYS from "./visitor-keys.js";

/**
 * @typedef {import('./visitor-keys.js').VisitorKeyTypes} VisitorKeyTypes
 */

/* eslint-disable jsdoc/valid-types -- jsdoc-type-pratt-parser can't parse template literal types */
/**
 * @template T
 * @typedef {Exclude<Extract<import('./types.js').KeyOfUnion<T>, string>, KEY_FILTER[number] | `_${string}`>} FilteredKeysOf
 */
/* eslint-enable jsdoc/valid-types -- jsdoc-type-pratt-parser can't parse template literal types */

/**
 * @template {string} [NodeTypes=string]
 * @template {object} [Node=Record<string,unknown>]
 * @typedef {Readonly<Record<NodeTypes, ReadonlyArray<FilteredKeysOf<Node>>>>} VisitorKeys
 */

// List to ignore keys.
const KEY_FILTER = /** @type {const} */ ([
    "parent",
    "leadingComments",
    "trailingComments"
]);

/* eslint-disable jsdoc/valid-types -- jsdoc-type-pratt-parser can't parse template literal types */
/**
 * Check whether a given key should be used or not.
 * @template {string|number|symbol} K
 * @template {string} T
 * @param {K|T} key The key to check.
 * @param {ReadonlyArray<T>} filterlist The list of keys to filter out.
 * @returns {key is Exclude<Extract<K, string>, T | `_${string}`>} `true` if the key should be used.
 */
function isFiltered(key, filterlist) {
    return !filterlist.includes(/** @type {T} */ (key)) && typeof key === "string" && key[0] !== "_";
}
/* eslint-enable jsdoc/valid-types -- jsdoc-type-pratt-parser can't parse template literal types */

/**
 * Get visitor keys of a given node.
 * @template {object} T
 * @param {T} node The AST node to get keys.
 * @returns {ReadonlyArray<FilteredKeysOf<T>>} Visitor keys of the node.
 */
export function getKeys(node) {

    /** @type {FilteredKeysOf<T>[]} */
    const result = [];

    for (const key of /** @type {import('./types.js').KeyOfUnion<T>[]} */ (Object.keys(node))) {
        if (isFiltered(key, KEY_FILTER)) {
            result.push(key);
        }
    }
    return result;
}

/**
 * Make the union set with `KEYS` and given keys.
 * @template {VisitorKeys} T
 * @param {T} additionalKeys The additional keys.
 * @returns {VisitorKeys<VisitorKeyTypes | Extract<keyof T, string>>} The union set.
 */
export function unionWith(additionalKeys) {

    /** @type {Record<VisitorKeyTypes | keyof T, ReadonlyArray<string>>} */
    const retv = { ...additionalKeys, ...KEYS };

    for (const type of /** @type {Array<keyof T>} */ (Object.keys(additionalKeys))) {
        if (Object.hasOwn(KEYS, type)) {
            const keys = new Set(additionalKeys[type]);

            for (const key of KEYS[/** @type {VisitorKeyTypes} */ (type)]) {
                keys.add(key);
            }

            retv[type] = Object.freeze(Array.from(keys));
        } else {
            retv[type] = Object.freeze(Array.from(additionalKeys[type]));
        }
    }

    return Object.freeze(retv);
}

export { KEYS };
