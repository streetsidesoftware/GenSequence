import { describe, expect, test } from 'vitest';

import { fib } from './fibonacci.js';

describe('validate fibonacci example', () => {
    test('test getting 5 values', () => {
        expect(fib(5)).toEqual([1, 1, 2, 3, 5]);
    });

    test('tests getting the 5th value', () => {
        expect(fib(5)).toEqual([1, 1, 2, 3, 5]);
    });
});
