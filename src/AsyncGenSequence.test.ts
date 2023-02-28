import { describe, expect, test } from 'vitest';

import { asyncGenSequence } from './AsyncGenSequence';

describe('AsyncGenSequence Tests', () => {
    test('tests reducing asynchronously a sequence w/o init', async () => {
        const asyncGenerator = createAsyncGeneratorFor([1, 2, 3, 4, 5]);
        const gs = asyncGenSequence(asyncGenerator);
        const result = await gs.reduceAsync((a, v) => a + v);
        expect(result).toEqual(15);
    });

    test('tests reducing asynchronously a sequence with init', async () => {
        const asyncGenerator = createAsyncGeneratorFor([1, 2, 3, 4, 5])();
        const gs = asyncGenSequence(asyncGenerator);
        const result = await gs.reduceAsync(async (a, v) => a + v, Promise.resolve(10));
        expect(result).toEqual(25);
    });

    test('tests async iterator attribute', async () => {
        const asyncGenerator = createAsyncGeneratorFor([1, 2, 3]);
        const asyncIterator = asyncGenSequence(asyncGenerator)[Symbol.asyncIterator]();
        const result1 = await asyncIterator.next();
        const result2 = await asyncIterator.next();
        const result3 = await asyncIterator.next();
        const result4 = await asyncIterator.next();
        expect(result1.value).toEqual(1);
        expect(result1.done).toEqual(false);
        expect(result2.value).toEqual(2);
        expect(result3.done).toEqual(false);
        expect(result3.value).toEqual(3);
        expect(result3.done).toEqual(false);
        expect(result4.value).toEqual(undefined);
        expect(result4.done).toEqual(true);
    });
});

function createAsyncGeneratorFor<T>(array: T[]) {
    return async function* asyncGenerator() {
        for (const i of array) {
            yield i;
        }
    };
}
