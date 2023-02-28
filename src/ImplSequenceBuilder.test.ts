import { describe, expect, test } from 'vitest';
import { ImplSequenceBuilder } from './ImplSequenceBuilder.js';
import { map, filter } from './operators/index.js';
import { scanMap } from './operators/operatorsBase.js';
import { builder } from './builder.js';

describe('Verify ImplSequenceBuilder', () => {
    function getBuilder() {
        return builder.map((a: number) => a);
    }

    test('Test empty builder', () => {
        const a = [1, 2, 3];
        const b = new ImplSequenceBuilder();
        const i = b.build(a);
        expect([...i]).toEqual(a);
    });

    test('Test empty builder', () => {
        const a = [1, 2, 3];
        const b = getBuilder();
        const i = b.build(a);
        expect([...i]).toEqual(a);
    });

    test('Test map', () => {
        const fn = (a: number) => a * 2;
        const a = [1, 2, 3];
        const b = getBuilder().map(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a.map(fn));
    });

    test('Test pipe', () => {
        const fn = (a: number) => a * 2;
        const fn2 = (a: number) => a > 10;
        const fn3 = (a: number) => a > 12;
        const a = [1, 2, 3, 4];
        const b = getBuilder().pipe(map(fn), map(fn), filter(fn2), filter(fn3));
        const i = b.build(a);
        expect([...i]).toEqual([16]);
    });

    test('Test filter', () => {
        const fn = (a: number) => !!(a % 2);
        const a = [1, 2, 3, 4];
        const b = getBuilder().filter(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a.filter(fn));
    });

    test('Test skip', () => {
        const a = [1, 2, 3];
        const b = getBuilder().skip(2);
        const i = b.build(a);
        expect([...i]).toEqual(a.slice(2));
    });

    test('Test take', () => {
        const a = [1, 2, 3];
        const b = getBuilder().take(2);
        const i = b.build(a);
        expect([...i]).toEqual(a.slice(0, 2));
    });

    test('Test concat', () => {
        const a = [1, 2, 3];
        const c = [6, 7, 8];
        const b = getBuilder().concat(c);
        const i = b.build(a);
        expect([...i]).toEqual(a.concat(c));
    });

    test('Test concatMap', () => {
        const fn = (a: number) => [a];
        const a = [1, 2, 3];
        const b = getBuilder().concatMap(fn);
        const i = b.build(a);
        expect([...i]).toEqual(a);
    });

    test('Test scan', () => {
        const fn = (acc: number, cur: number) => acc + cur;
        const a = [1, 2, 3];
        const b = getBuilder().scan(fn, 0);
        const i = b.build(a);
        expect([...i]).toEqual(a.map(scanMap(fn, 0)));
    });

    test('Test combine', () => {
        const fn = (a: number, b: number | undefined) => a + (b ?? 0);
        const a = [1, 2, 3];
        const b = getBuilder().combine(fn, a);
        const i = b.build(a);
        expect([...i]).toEqual(a.map((a) => a * 2));
    });
});
