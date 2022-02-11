import { expectType, expectAssignable, expectError } from 'tsd';

import { KEYS, getKeys, unionWith, VisitorKeys } from "../";

type VisitorKeysWritable = { [type: string]: ReadonlyArray<string> };

const assignmentExpression = {
    type: "AssignmentExpression",
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
    ]
};

expectType<{readonly [type: string]: readonly string[]}>(KEYS);

expectType<readonly string[]>(getKeys(assignmentExpression));

expectType<{readonly [type: string]: readonly string[]}>(unionWith({
    TestInterface1: ["left", "right"],
    TestInterface2: ["expression"]
}));

const keys: {
    [type: string]: readonly string[]
} = {
    TestInterface1: ["left", "right"]
};

const readonlyKeys: {
    readonly [type: string]: readonly string[]
} = {
    TestInterface1: ["left", "right"]
};

expectAssignable<VisitorKeysWritable>(keys);

expectAssignable<VisitorKeys>(readonlyKeys);

expectError(() => {
    const erring: VisitorKeysWritable = {
        TestInterface1: ["left", "right"]
    };
    erring.TestInterface1 = "badType";
});

// https://github.com/SamVerschueren/tsd/issues/143
// expectError(() => {
//     const erring: VisitorKeys = {
//         TestInterface1: ["left", "right"]
//     };
//     erring.TestInterface1 = ["badAttemptOverwrite"];
// });
