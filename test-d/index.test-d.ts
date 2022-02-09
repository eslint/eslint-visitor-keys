import {expectType, expectAssignable} from 'tsd';

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

expectAssignable<KeysStrict>({
    TestInterface1: ["left", "right"]
});
expectAssignable<KeysStrictReadonly>({
    TestInterface1: ["left", "right"]
});
