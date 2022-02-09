import { expectType, expectAssignable, expectError } from 'tsd';

import { KEYS, getKeys, unionWith, KeysStrict, KeysStrictReadonly } from "../lib/index.js";

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

expectAssignable<KeysStrict>(keys);

expectAssignable<KeysStrictReadonly>(readonlyKeys);

expectError(() => {
    const erring: KeysStrict = {
        TestInterface1: ["left", "right"]
    };
    erring.TestInterface1 = "badType";
});

// https://github.com/SamVerschueren/tsd/issues/143
// expectError(() => {
//     const erring: KeysStrictReadonly = {
//         TestInterface1: ["left", "right"]
//     };
//     erring.TestInterface1 = ["badAttemptOverwrite"];
// });
