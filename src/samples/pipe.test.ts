import { describe, expect, test } from 'vitest';
import { builder } from '../builder.js';
import { pipe, map } from '../operators/index.js';

describe('Various usages of builder', () => {
    test('', () => {
        const fn = (a: number) => a.toString(16);
        const b = builder.pipe(
            pipe(
                map((a: number) => a),
                map((a) => a.toString(16)),
            ),
        );
        const v = [1, 2, 3, 4];
        expect([...b.build(v)]).toEqual(v.map(fn));
    });
});
