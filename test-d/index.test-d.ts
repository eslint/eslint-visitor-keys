import { expectType, expectAssignable, expectError } from 'tsd';

import { KEYS, getKeys, unionWith, VisitorKeys, VisitorKeyTypes } from "../";
import { KeyOfUnion } from '../lib/types';

const assignmentExpression = {
    _something: true,
    type: "AssignmentExpression",
    parent: 'abc',
    operator: "=",
    left: {
        type: "Identifier",
        name: "a",
        range: [
            0,
            1
        ]
    },
    right: {
        type: "Literal",
        value: 5,
        raw: "5",
        range: [
            4,
            5
        ]
    },
    range: [
        0,
        5
    ],
    leadingComments: 'abc',
    trailingComments: 'abc'
};

const readOnlyStringKeyedObject: {
    readonly [type: string]: readonly string[]
} = {
    TestInterface1: ["left", "right"],
    TestInterface2: ["expression"]
};

expectAssignable<{readonly [type: string]: readonly string[]}>(KEYS);
expectAssignable<VisitorKeys>(KEYS);
expectAssignable<VisitorKeys<VisitorKeyTypes, import("estree").Node | import("estree-jsx").Node>>(KEYS);
expectAssignable<Record<VisitorKeyTypes, ReadonlyArray<KeyOfUnion<import("estree").Node> | KeyOfUnion<import("estree-jsx").Node>>>>(KEYS);

expectType<readonly ["elements"]>(KEYS.ArrayPattern);

expectType<readonly ("type" | "operator" | "left" | "right" | "range")[]>(getKeys(assignmentExpression));
expectAssignable<readonly string[]>(getKeys(assignmentExpression));
expectType<readonly string[]>(getKeys(readOnlyStringKeyedObject));

expectType<Readonly<Record<VisitorKeyTypes | "TestInterface1" | "TestInterface2", readonly string[]>>>(unionWith({
    TestInterface1: ["left", "right"],
    TestInterface2: ["expression"]
}));
expectAssignable<{readonly [type: string]: readonly string[]}>(unionWith({
    TestInterface1: ["left", "right"],
    TestInterface2: ["expression"]
}));
expectType<Readonly<Record<string, readonly string[]>>>(unionWith(readOnlyStringKeyedObject));

expectAssignable<VisitorKeys>(readOnlyStringKeyedObject);

expectError(() => {
    const erring: VisitorKeys = {
        TestInterface1: ["left", "right"]
    };
    erring.TestInterface1 = ["badAttemptOverwrite"];
});
