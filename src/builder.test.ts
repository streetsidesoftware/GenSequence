import { describe, expect, test } from 'vitest';

import { builder } from './builder.js';
import { map } from './operators/index.js';
import { scanMap } from './operators/operatorsBase.js';
// import { genSequence } from '..js';

describe('Verify builder', () => {
    test('Test map', () => {
        const fn = (a: number) => a * 2;
        const a = [1, 2, 3];
        const b = builder.map(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a.map(fn));
    });

    test('Test pipe', () => {
        const fn = (a: number) => a * 2;
        const a = [1, 2, 3];
        const b = builder.pipe(map(fn));
        const i = b.build(a);
        expect([...i]).toEqual(a.map(fn));
    });

    test('Test filter', () => {
        const fn = (a: number) => !!(a % 2);
        const a = [1, 2, 3, 4];
        const b = builder.filter(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a.filter(fn));
    });

    test('Test skip', () => {
        const a = [1, 2, 3];
        const b = builder.skip(2);
        const i = b.build(a);
        expect([...i]).toEqual(a.slice(2));
    });

    test('Test take', () => {
        const a = [1, 2, 3];
        const b = builder.take(2);
        const i = b.build(a);
        expect([...i]).toEqual(a.slice(0, 2));
    });

    test('Test concat', () => {
        const a = [1, 2, 3];
        const c = [6, 7, 8];
        const b = builder.concat(c);
        const i = b.build(a);
        expect([...i]).toEqual(a.concat(c));
    });

    test('Test concatMap', () => {
        const fn = (a: number) => [a];
        const a = [1, 2, 3];
        const b = builder.concatMap(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a);
    });

    test('Test scan', () => {
        const fn = (acc: number, cur: number) => acc + cur;
        const a = [1, 2, 3];
        const b = builder.scan(fn, 0);
        const i = b.build(a);
        expect([...i]).toEqual(a.map(scanMap(fn, 0)));
    });

    test('Test combine', () => {
        const fn = (a: number, b: number | undefined) => a + (b ?? 0);
        const a = [1, 2, 3];
        const b = builder.combine(fn, a);
        const i = b.build(a);
        expect([...i]).toEqual(a.map((a) => a * 2));
    });
});
