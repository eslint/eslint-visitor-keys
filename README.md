# eslint-visitor-keys

[![npm version](https://img.shields.io/npm/v/eslint-visitor-keys.svg)](https://www.npmjs.com/package/eslint-visitor-keys)
[![Downloads/month](https://img.shields.io/npm/dm/eslint-visitor-keys.svg)](http://www.npmtrends.com/eslint-visitor-keys)
[![Build Status](https://github.com/eslint/eslint-visitor-keys/workflows/CI/badge.svg)](https://github.com/eslint/eslint-visitor-keys/actions)

Constants and utilities about visitor keys to traverse AST.

## 💿 Installation

Use [npm] to install.

```bash
$ npm install eslint-visitor-keys
```

### Requirements

- [Node.js] `^18.18.0`, `^20.9.0`, or `>=21.1.0`


## 📖 Usage

To use in an ESM file:

```js
import * as evk from "eslint-visitor-keys"
```

To use in a CommonJS file:

```js
const evk = require("eslint-visitor-keys")
```

### evk.KEYS

> type: `VisitorKeys<VisitorKeyTypes>`

Visitor keys. This keys are frozen.

This is an object. Keys are the type of [ESTree] nodes. Their values are an array of property names which have child nodes.

For example:

```
console.log(evk.KEYS.AssignmentExpression) // → ["left", "right"]
```

### evk.getKeys(node)

> type: `(node: object) => FilteredKeysOf<node>[]`

Get the visitor keys of a given AST node.

This is similar to `Object.keys(node)` of ES Standard, but some keys are excluded: `parent`, `leadingComments`, `trailingComments`, and names which start with `_`.

This will be used to traverse unknown nodes.

For example:

```js
const node = {
    _something: true,
    type: "AssignmentExpression",
    left: { type: "Identifier", name: "foo" },
    right: { type: "Literal", value: 0 },
}
console.log(evk.getKeys(node)) // → ["type", "left", "right"]
```

### evk.unionWith(additionalKeys)

> type: `(additionalKeys: object) => VisitorKeys<VisitorKeyTypes | keyof additionalKeys>`

Make the union set with `evk.KEYS` and the given keys.

- The order of keys is, `additionalKeys` is at first, then `evk.KEYS` is concatenated after that.
- It removes duplicated keys as keeping the first one.

For example:

```js
console.log(evk.unionWith({
    MethodDefinition: ["decorators"]
})) // → { ..., MethodDefinition: ["decorators", "key", "value"], ... }
```

## Types

### VisitorKeyTypes

A union of string literals representing all the keys on `evk.KEYS`:

```
"ArrayExpression" | "ArrayPattern" | ...
```

### VisitorKeys

Defines the base shape of `evk.KEYS` style objects.

Takes two optional inputs: `VisitorKeys<NodeTypes, Node>`

* `NodeTypes` makes up the keys of `VisitorKeys`, should be the type of [ESTree] nodes
* `Node` represents the [ESTree] nodes themselves and is used to calculate possible values of `VisitorKeys`, an array of property names which have child nodes

Default inputs: `VisitorKeys<string, Record<string, unknown>>`

Example: The type of `evk.KEYS` is roughly equivalent to:

```ts
VisitorKeys<VisitorKeyTypes, import("estree").Node | import("estree-jsx").Node>
```

### FilteredKeysOf\<T>

Similar to `keyof T` but:

* Filters away keys just like `evk.getKeys` does
* Rather than only returning commons keys when `T` is a union it instead returns all keys

Example:

```ts
FilteredKeysOf<
  { parent: 123, abc: true, xyz: true },
  { parent: 456, abc: true, def: true },
>
```

equals

```ts
'abc' | 'xyz' |
```


## 📰 Change log

See [GitHub releases](https://github.com/eslint/eslint-visitor-keys/releases).

## 🍻 Contributing

Welcome. See [ESLint contribution guidelines](https://eslint.org/docs/developer-guide/contributing/).

### Development commands

- `npm test` runs tests and measures code coverage.
- `npm run lint` checks source codes with ESLint.
- `npm run test:open-coverage` opens the code coverage report of the previous test with your default browser.


[npm]: https://www.npmjs.com/
[Node.js]: https://nodejs.org/
[ESTree]: https://github.com/estree/estree
