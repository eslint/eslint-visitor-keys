/**
 * @fileoverview Script to build our visitor keys based on TypeScript AST.
 *
 * Uses `get-keys-from-ts.js` to read the files and build the keys and then
 * merges them in alphabetical order of Node type before writing to file.
 *
 * @author Brett Zamir
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { promises } from "fs";
import { parseForESLint } from "@typescript-eslint/parser";
import esquery from "esquery";

import { getKeys, KEYS } from "../lib/index.js";

const { readFile } = promises;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const exemptedTypes = new Set([
    "TSUndefinedKeyword",
    "TSNullKeyword",
    "TSUnknownKeyword",
    "TSBooleanKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
    "TSLiteralType", // E.g., `true`

    // Apparently used for primitives, so exempting
    "TSTypeLiteral", // E.g., `{value: {cooked, raw}}`

    "TSUnionType", // I.e., `|`
    "TSTypeReference"
]);

// All items ending in `Statement` or `Operator` are also traversable
const traversableTypes = new Set([
    "Array",
    "CatchClause",
    "ChainElement",
    "ClassBody",
    "Declaration",
    "Expression",
    "FunctionExpression",
    "Identifier",
    "JSXClosingFragment",
    "JSXIdentifier",
    "JSXMemberExpression",
    "JSXOpeningElement",
    "JSXOpeningFragment",
    "JSXClosingElement",
    "Literal",
    "Pattern",
    "SourceLocation",
    "TemplateLiteral",
    "VariableDeclaration"
]);

const notTraversableTypes = new Set([
    "RegExp",
    "TSUndefinedKeyword",
    "TSNullKeyword",
    "TSBooleanKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
    "TSBigIntKeyword",
    "TSLiteralType"
]);

/**
 * Checks if a name is traverseable
 * @param {string} name The name to check
 * @returns {boolean} Whether it is traversable.
 */
function isKnownTraversable(name) {
    return name && (name.endsWith("Operator") || name.endsWith("Statement") || traversableTypes.has(name));
}

/**
 * Determine whether the Node is traversable
 * @param {Node} annotationType The annotation type Node
 * @returns {boolean} Whether the node is traversable
 */
function checkTraversability(annotationType) {
    if (
        notTraversableTypes.has(annotationType.type)
    ) {
        return false;
    }

    if (annotationType.type === "TSTupleType") {
        return annotationType.elementTypes.some(annType => checkTraversability(annType));
    }

    if (notTraversableTypes.has(annotationType.typeName.name)) {
        return false;
    }

    if (!isKnownTraversable(annotationType.typeName.name)) {

        // Todo?
        /*
        const innerInterfaceName = tsAnnotation.typeName.name;
        const innerTsDeclarationNode = findTsInterfaceDeclaration(innerInterfaceName);

        if (!innerTsDeclarationNode) {

            const innerTsTypeNode = findTsTypeDeclaration(innerInterfaceName);

            // We might iterate types here to see if children are iterable and
            //   fail if not

            unrecognizedTSTypeReferences.add(tsAnnotation.typeName.name);
            break;
        }

        // We might iterate interfaces here to see if children are iterable
        //   (see `addNodeForInterface` for a pattern of iteration)
        */

        throw new Error(`Type unknown as to traversability: ${annotationType.typeName.name}`);
    }

    return true;
}

/**
 * Get the literal names out of AST
 * @param {Node} excludedItem Excluded node
 * @returns {string[]} The literal names
 */
function findOmitTypes(excludedItem) {
    if (excludedItem.type === "TSUnionType") {
        return excludedItem.types.map(typeNode => findOmitTypes(typeNode));
    }
    return excludedItem.literal.value;
}

/**
 * Checks whether property should be excluded
 * @param {string} property Property to check
 * @param {string[]} excludedProperties Properties not to allow
 * @returns {boolean} Whether or not to be excluded
 */
function isPropertyExcluded(property, excludedProperties) {
    return excludedProperties && excludedProperties.includes(property);
}

//------------------------------------------------------------------------------
// Public APIs
//------------------------------------------------------------------------------

/**
 * Returns alphabetized keys
 * @param {KeysStrict} initialNodes Initial node list to sort
 * @returns {KeysStrict} The keys
 */
function alphabetizeKeyInterfaces(initialNodes) {

    /**
     * Alphabetize
     * @param {string} typeA The first type to compare
     * @param {string} typeB The second type to compare
     * @returns {1|-1} The sorting index
     */
    function alphabetize([typeA], [typeB]) {
        return typeA < typeB ? -1 : 1;
    }
    const sortedNodeEntries = Object.entries(initialNodes).sort(alphabetize);

    /**
     * Get the key sorter for a given type
     * @param {string} type The type
     * @returns {(string, string) => -1|1} The sorter
     */
    function getKeySorter(type) {
        const sequence = KEYS[type];

        /**
         * Alphabetize
         * @param {string} typeA The first type to compare
         * @param {string} typeB The second type to compare
         * @returns {1|-1} The sorting index
         */
        return function sortKeys(typeA, typeB) {
            if (!sequence) {
                return typeA < typeB ? -1 : 1;
            }

            const idxA = sequence.indexOf(typeA);
            const idxB = sequence.indexOf(typeB);

            if (idxA === -1 && idxB === -1) {
                return typeA < typeB ? -1 : 1;
            }
            if (idxA === -1) {
                return 1;
            }
            if (idxB === -1) {
                return -1;
            }

            return idxA < idxB ? -1 : 1;
        };
    }

    for (const [type, keys] of sortedNodeEntries) {
        keys.sort(getKeySorter(type));
    }

    return Object.fromEntries(sortedNodeEntries);
}

/**
 * Builds visitor keys based on TypeScript declaration.
 * @param {string} code TypeScript declaration file as code to parse.
 * @param {{supplementaryDeclarations: Node[]}} [options] The options
 * @returns {Promise<VisitorKeysExport>} The built visitor keys
 */
async function getKeysFromTs(code, {

    // Todo: Ideally we'd just get these from the import
    supplementaryDeclarations = {
        allTsInterfaceDeclarations: [],
        exportedTsInterfaceDeclarations: []
    }
} = {}) {
    const unrecognizedTSTypeReferences = new Set();
    const unrecognizedTSTypes = new Set();

    const parsedTSDeclaration = parseForESLint(code);

    const allTsInterfaceDeclarations = [...esquery.query(
        parsedTSDeclaration.ast,
        "TSInterfaceDeclaration",
        {

            // TypeScript keys here to find our *.d.ts nodes (not for the ESTree
            //   ones we want)
            visitorKeys: parsedTSDeclaration.visitorKeys
        }
    ), ...supplementaryDeclarations.allTsInterfaceDeclarations];

    const exportedTsInterfaceDeclarations = [...esquery.query(
        parsedTSDeclaration.ast,
        "ExportNamedDeclaration > TSInterfaceDeclaration",
        {

            // TypeScript keys here to find our *.d.ts nodes (not for the ESTree
            //   ones we want)
            visitorKeys: parsedTSDeclaration.visitorKeys
        }
    ), ...supplementaryDeclarations.exportedTsInterfaceDeclarations];

    // const tsTypeDeclarations = esquery.query(
    //     parsedTSDeclaration.ast,
    //     "TSTypeAliasDeclaration",
    //     {
    //
    //         // TypeScript keys here to find our *.d.ts nodes (not for the ESTree
    //         //   ones we want)
    //         visitorKeys: parsedTSDeclaration.visitorKeys
    //     }
    // );
    const initialNodes = {};

    /**
     * Finds a TypeScript interfaction declaration.
     * @param {string} interfaceName The type name.
     * @returns {Node} The interface declaration node
     */
    function findTsInterfaceDeclaration(interfaceName) {
        return allTsInterfaceDeclarations.find(
            innerTsDeclaration => innerTsDeclaration.id.name === interfaceName
        );
    }

    /**
     * Adds a node for a given interface.
     * @param {string} interfaceName Name of the interface
     * @param {Node} tsDeclarationNode TypeScript declaration node
     * @param {Node} node The Node on which to build
     * @param {string[]} excludedProperties Excluded properties
     * @returns {void}
     */
    function addNodeForInterface(interfaceName, tsDeclarationNode, node, excludedProperties) {
        const tsPropertySignatures = tsDeclarationNode.body.body;

        for (const tsPropertySignature of tsPropertySignatures) {
            const property = tsPropertySignature.key.name;

            if (isPropertyExcluded(property, excludedProperties)) {
                continue;
            }

            const tsAnnotation = tsPropertySignature.typeAnnotation.typeAnnotation;
            const tsPropertyType = tsAnnotation.type;

            // For sanity-checking
            if (!exemptedTypes.has(tsPropertyType)) {
                unrecognizedTSTypes.add(tsPropertyType);
                continue;
            }

            switch (tsPropertyType) {
                case "TSUnionType":
                    if (tsAnnotation.types.some(checkTraversability)) {
                        break;
                    }
                    continue;
                case "TSTypeReference": {
                    if (checkTraversability(tsAnnotation)) {
                        break;
                    }

                    continue;
                } default:
                    continue;
            }

            node[property] = null;
        }

        for (const extension of tsDeclarationNode.extends || []) {
            const { typeParameters, expression } = extension;
            const innerInterfaceName = expression.name;

            if (typeParameters) {
                if (innerInterfaceName !== "Omit") {
                    throw new Error("Unknown type parameter");
                }

                const [param, ...excludedAST] = typeParameters.params;
                const paramInterfaceName = param.typeName.name;
                const excluded = excludedAST.flatMap(findOmitTypes);

                const innerTsDeclarationNode = findTsInterfaceDeclaration(paramInterfaceName);

                if (!innerTsDeclarationNode) {
                    unrecognizedTSTypeReferences.add(paramInterfaceName);
                    return;
                }

                addNodeForInterface(paramInterfaceName, innerTsDeclarationNode, node, excluded);
            } else {
                const innerTsDeclarationNode = findTsInterfaceDeclaration(innerInterfaceName);

                if (!innerTsDeclarationNode) {
                    unrecognizedTSTypeReferences.add(innerInterfaceName);
                    return;
                }

                addNodeForInterface(innerInterfaceName, innerTsDeclarationNode, node);
            }
        }
    }

    for (const tsDeclarationNode of exportedTsInterfaceDeclarations) {
        const interfaceName = tsDeclarationNode.id.name;

        const typeName = tsDeclarationNode.body.body.find(
            prop => prop.key.name === "type"
        )?.typeAnnotation?.typeAnnotation?.literal?.value;

        if (!typeName) {
            continue;
        }

        const node = {};

        addNodeForInterface(interfaceName, tsDeclarationNode, node);

        initialNodes[typeName] = [...new Set(getKeys(node), ...(initialNodes[typeName] || []))];
    }

    const nodes = alphabetizeKeyInterfaces(initialNodes);

    if (unrecognizedTSTypes.size) {
        throw new Error(
            "Unhandled TypeScript type; please update the code to " +
            "handle the type or if not relevant, add it to " +
            "`unrecognizedTSTypes`; see\n\n  " +
            `${[...unrecognizedTSTypes].join(", ")}\n`
        );
    }
    if (unrecognizedTSTypeReferences.size) {
        throw new Error(
            "Unhandled TypeScript type reference; please update the code to " +
            "handle the type reference or if not relevant, add it to " +
            "`unrecognizedTSTypeReferences`; see\n\n  " +
            `${[...unrecognizedTSTypeReferences].join(", ")}\n`
        );
    }

    return {
        keys: nodes,
        tsInterfaceDeclarations: {
            allTsInterfaceDeclarations,
            exportedTsInterfaceDeclarations
        }
    };
}

/**
 * @typedef {{tsInterfaceDeclarations: {
 *   allTsInterfaceDeclarations: {
 *     Node[],
 *     keys: KeysStrict
 *   },
 *   exportedTsInterfaceDeclarations:
 *     Node[],
 *     keys: KeysStrict
 *   }
 * }}} VisitorKeysExport
 */

/**
 * Builds visitor keys based on TypeScript declaration.
 * @param {string} file TypeScript declaration file to parse.
 * @param {{supplementaryDeclarations: Node[]}} options The options
 * @returns {Promise<VisitorKeysExport>} The built visitor keys
 */
async function getKeysFromTsFile(file, options) {
    const code = await readFile(file);

    return await getKeysFromTs(code, options);
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

export { alphabetizeKeyInterfaces, getKeysFromTs, getKeysFromTsFile };
