/**
 * @typedef {import('./index.js').KeysStrictReadonly} KeysStrictReadonly
 */

/**
 * @type {KeysStrictReadonly}
 */
const KEYS = {
    ArrayExpression: [
        "elements"
    ],
    ArrayPattern: [
        "elements"
    ],
    ArrowFunctionExpression: [
        "body",
        "params"
    ],
    AssignmentExpression: [
        "left",
        "right"
    ],
    AssignmentPattern: [
        "left",
        "right"
    ],
    AwaitExpression: [
        "argument"
    ],
    BinaryExpression: [
        "left",
        "right"
    ],
    BlockStatement: [
        "body"
    ],
    BreakStatement: [
        "label"
    ],
    CallExpression: [
        "callee",
        "arguments"
    ],
    CatchClause: [
        "body",
        "param"
    ],
    ChainExpression: [
        "expression"
    ],
    ClassBody: [
        "body"
    ],
    ClassDeclaration: [
        "body",
        "id",
        "superClass"
    ],
    ClassExpression: [
        "body",
        "id",
        "superClass"
    ],
    ConditionalExpression: [
        "alternate",
        "consequent",
        "test"
    ],
    ContinueStatement: [
        "label"
    ],
    DebuggerStatement: [],
    DoWhileStatement: [
        "body",
        "test"
    ],
    EmptyStatement: [],
    ExperimentalRestProperty: [
        "argument"
    ],
    ExperimentalSpreadProperty: [
        "argument"
    ],
    ExportAllDeclaration: [
        "exported",
        "source"
    ],
    ExportDefaultDeclaration: [
        "declaration"
    ],
    ExportNamedDeclaration: [
        "declaration",
        "specifiers",
        "source"
    ],
    ExportSpecifier: [
        "exported",
        "local"
    ],
    ExpressionStatement: [
        "expression"
    ],
    ForInStatement: [
        "body",
        "left",
        "right"
    ],
    ForOfStatement: [
        "body",
        "left",
        "right"
    ],
    ForStatement: [
        "body",
        "init",
        "test",
        "update"
    ],
    FunctionDeclaration: [
        "body",
        "id",
        "params"
    ],
    FunctionExpression: [
        "body",
        "id",
        "params"
    ],
    Identifier: [],
    IfStatement: [
        "alternate",
        "consequent",
        "test"
    ],
    ImportDeclaration: [
        "specifiers",
        "source"
    ],
    ImportDefaultSpecifier: [
        "local"
    ],
    ImportExpression: [
        "source"
    ],
    ImportNamespaceSpecifier: [
        "local"
    ],
    ImportSpecifier: [
        "imported",
        "local"
    ],
    JSXAttribute: [
        "name",
        "value"
    ],
    JSXClosingElement: [
        "name"
    ],
    JSXClosingFragment: [],
    JSXElement: [
        "children",
        "closingElement",
        "openingElement"
    ],
    JSXEmptyExpression: [],
    JSXExpressionContainer: [
        "expression"
    ],
    JSXFragment: [
        "children",
        "closingFragment",
        "openingFragment"
    ],
    JSXIdentifier: [],
    JSXMemberExpression: [
        "object",
        "property"
    ],
    JSXNamespacedName: [
        "namespace",
        "name"
    ],
    JSXOpeningElement: [
        "attributes",
        "name"
    ],
    JSXOpeningFragment: [],
    JSXSpreadAttribute: [
        "argument"
    ],
    JSXText: [],
    LabeledStatement: [
        "body",
        "label"
    ],
    Literal: [],
    LogicalExpression: [
        "left",
        "right"
    ],
    MemberExpression: [
        "object",
        "property"
    ],
    MetaProperty: [
        "meta",
        "property"
    ],
    MethodDefinition: [
        "key",
        "value"
    ],
    NewExpression: [
        "arguments",
        "callee"
    ],
    ObjectExpression: [
        "properties"
    ],
    ObjectPattern: [
        "properties"
    ],
    PrivateIdentifier: [],
    Program: [
        "body"
    ],
    Property: [
        "key",
        "value"
    ],
    PropertyDefinition: [
        "key",
        "value"
    ],
    RestElement: [
        "argument"
    ],
    ReturnStatement: [
        "argument"
    ],
    SequenceExpression: [
        "expressions"
    ],
    SpreadElement: [
        "argument"
    ],
    StaticBlock: [
        "body"
    ],
    Super: [],
    SwitchCase: [
        "consequent",
        "test"
    ],
    SwitchStatement: [
        "cases",
        "discriminant"
    ],
    TaggedTemplateExpression: [
        "quasi",
        "tag"
    ],
    TemplateElement: [],
    TemplateLiteral: [
        "expressions",
        "quasis"
    ],
    ThisExpression: [],
    ThrowStatement: [
        "argument"
    ],
    TryStatement: [
        "block",
        "finalizer",
        "handler"
    ],
    UnaryExpression: [
        "argument"
    ],
    UpdateExpression: [
        "argument"
    ],
    VariableDeclaration: [
        "declarations"
    ],
    VariableDeclarator: [
        "id",
        "init"
    ],
    WhileStatement: [
        "body",
        "test"
    ],
    WithStatement: [
        "body",
        "object"
    ],
    YieldExpression: [
        "argument"
    ]
};

// Types.
const NODE_TYPES = Object.keys(KEYS);

// Freeze the keys.
for (const type of NODE_TYPES) {
    Object.freeze(KEYS[type]);
}
Object.freeze(KEYS);

export default KEYS;
