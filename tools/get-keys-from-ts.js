import { promises } from "fs";

import { parseForESLint } from "@typescript-eslint/parser";

import esquery from "esquery";

import { getKeys } from "../lib/index.js";

const { readFile } = promises;

const propertiesToIgnore = new Set([
    "comments",
    "innerComments",
    "type",
    "operator"
]);

const exemptedTypes = new Set([
    "TSBooleanKeyword",
    "TSNumberKeyword",
    "TSStringKeyword",
    "TSLiteralType", // E.g., `true`

    // Apparently used for primitives, so exempting
    "TSTypeLiteral", // E.g., `{value: {cooked, raw}}`

    "TSUnionType", // I.e., `|`
    "TSTypeReference"
]);

// Also excluding interfaces starting with "Base" in some contexts
const interfacesToIgnore = new Set([
    "Comment",
    "Position",
    "RegExp",
    "SourceLocation"
]);

/**
 * Whether to ignore interface
 * @param {string} type Type to check.
 * @returns {boolean} If to be ignored.
 */
function ignoreInterface(type) {
    return type.startsWith("Base") || interfacesToIgnore.has(type);
}

// All items ending in `Statement` are also traversable
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
    "TemplateLiteral",
    "VariableDeclaration"
]);

const notTraversableTypes = new Set([
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
function isTraversable(name) {
    return name && (name.endsWith("Statement") || traversableTypes.has(name));
}

/**
 * Determine whether the Node is traversable
 * @param {Node} annotationType The annotation type Node
 * @returns {boolean} Whether the node is traversable
 */
function checkTraversability(annotationType) {
    if (
        notTraversableTypes.has(annotationType.type) ||
        interfacesToIgnore.has(annotationType.typeName?.name)
    ) {
        return false;
    }

    if (annotationType.type === "TSTupleType") {
        return annotationType.elementTypes.some(annType => checkTraversability(annType));
    }

    if (!isTraversable(annotationType.typeName.name)) {

        // Todo?
        /*
        const innerInterfaceName = tsAnnotation.typeName.name;
        const innerTsDeclarationNode = findTsInterfaceDeclaration(innerInterfaceName);

        if (!innerTsDeclarationNode) {

            const innerTsTypeNode = findTsTypeDeclaration(innerInterfaceName);

            // We might iterate types here to see if children are iterable and
            //   fail if not

            unrecognizedTSTypeReferences.add(`${tsAnnotation.typeName.name}`);
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
    if (excludedItem.type !== "TSLiteralType") {
        throw new Error("Processing of non-literals in `Omit` not currently supported");
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
    return propertiesToIgnore.has(property) ||
        (excludedProperties && excludedProperties.includes(property));
}

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

    for (const [, keys] of sortedNodeEntries) {
        keys.sort(alphabetize);
    }

    console.log('sortedNodeEntries', sortedNodeEntries);

    return Object.fromEntries(sortedNodeEntries);
}

/**
 * Builds visitor keys based on TypeScript declaration.
 * @param {string} code TypeScript declaration file as code to parse.
 * @param {{supplementaryDeclarations: Node[]}} [options] The options
 * @returns {Promise<{tsInterfaceDeclarations: Node[], keys: KeysStrict}>} The built visitor keys
 */
async function getKeysFromTs(code, {

    // Todo: Ideally we'd just get these from the import
    supplementaryDeclarations = []
} = {}) {
    const unrecognizedTSTypeReferences = new Set();
    const unrecognizedTSTypes = new Set();

    const parsedTSDeclaration = parseForESLint(code);
    const tsInterfaceDeclarations = [...esquery.query(
        parsedTSDeclaration.ast,
        "TSInterfaceDeclaration",
        {

            // TypeScript keys here to find our *.d.ts nodes (not for the ESTree
            //   ones we want)
            visitorKeys: parsedTSDeclaration.visitorKeys
        }
    ), ...supplementaryDeclarations];

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
     * @param {string} interfaceName The interface name.
     * @returns {Node} The interface declaration node
     */
    function findTsInterfaceDeclaration(interfaceName) {
        return tsInterfaceDeclarations.find(
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
        if (interfacesToIgnore.has(interfaceName)) {
            return;
        }

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
                    throw new Error("Unknown extension type with parameters");
                }

                const [param, ...excludedAST] = typeParameters.params;
                const paramInterfaceName = param.typeName.name;
                const excluded = excludedAST.flatMap(findOmitTypes);
                const innerTsDeclarationNode = findTsInterfaceDeclaration(paramInterfaceName);

                if (!innerTsDeclarationNode) {
                    unrecognizedTSTypeReferences.add(`${paramInterfaceName}`);
                    return;
                }

                addNodeForInterface(paramInterfaceName, innerTsDeclarationNode, node, excluded);
            } else {
                const innerTsDeclarationNode = findTsInterfaceDeclaration(innerInterfaceName);

                if (!innerTsDeclarationNode) {
                    unrecognizedTSTypeReferences.add(`${innerInterfaceName}`);
                    return;
                }

                addNodeForInterface(innerInterfaceName, innerTsDeclarationNode, node);
            }
        }
    }

    for (const tsDeclarationNode of tsInterfaceDeclarations) {
        const interfaceName = tsDeclarationNode.id.name;

        if (ignoreInterface(interfaceName)) {
            continue;
        }

        const node = {};

        addNodeForInterface(interfaceName, tsDeclarationNode, node);

        initialNodes[interfaceName] = getKeys(node);
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
        tsInterfaceDeclarations
    };
}

/**
 * Builds visitor keys based on TypeScript declaration.
 * @param {string} file TypeScript declaration file to parse.
 * @param {{supplementaryDeclarations: Node[]}} options The options
 * @returns {Promise<{tsInterfaceDeclarations: Node[], keys: KeysStrict}} The built visitor keys
 */
async function getKeysFromTsFile(file, options) {
    const code = await readFile(file);

    return await getKeysFromTs(code, options);
}

export { alphabetizeKeyInterfaces, getKeysFromTs, getKeysFromTsFile };
