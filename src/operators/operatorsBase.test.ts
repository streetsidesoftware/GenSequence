import * as op from './operatorsBase';
import { toIterator } from '../util/util';

describe('Tests Operators', () => {
    test('test the curring part of GS.map', () => {
        const fnMap = op.map((a: number) => 2 * a);
        expect(fnMap).toBeInstanceOf(Function);
        expect([...fnMap([1, 2, 3])]).toEqual([2, 4, 6]);
    });

    test('tests scanMap -- running sum', () => {
        // let only the first occurrence of a value through.
        const result = [1, 2, 1, 3, 2, 1, 3]
        .map(op.scanMap<number>((acc, value) => acc + value));
        expect(result).toEqual([1, 3, 4, 7, 9, 10, 13]);
    });

    test('concat simple arrays', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        expect([...op.concat(a, new Set(b))]).toEqual(a.concat(b));
    });

    test('concat iterables', () => {
        const a = [1, 2, 3];
        const b = [4, 5, 6];
        const ia = forceIterable(a)
        const ib = forceIterable(b)
        expect([...op.concat(ia, ib)]).toEqual(a.concat(b));
    });

    test('concat iterables', () => {
        const a = [1, 2, 3];
        const ia = new Set(a).values();
        expect([...op.concat(ia, ia)]).toEqual(a);
        expect([...op.concat(a, a)]).toEqual(a.concat(a));
    });

    test('concat fib same iterable', () => {
        const v = [...op.take(5, fib())];
        const a = op.take(5, fib());
        expect([...op.concat(a, a)]).toEqual(v);
    });

    test('makeIterable from Iterable', () => {
        const a = [1, 2, 3];
        const i = op.makeIterable(toIterable(a));
        expect([...i,...i]).toEqual(a);
    });

    test('makeIterable from Iterator', () => {
        const a = [1, 2, 3];
        const i = op.makeIterable(toIterator(a));
        expect([...i,...i]).toEqual(a);
    });

    test('makeAsyncIterable from Iterable', async () => {
        const a = [1, 2, 3];
        const i = op.makeAsyncIterable(toIterable(a));
        const r: typeof a = [];
        for await (const v of i) {
            r.push(v);
        }
        expect(r).toEqual(a);
    });

    test('makeAsyncIterable from Iterator', async () => {
        const a = [1, 2, 3];
        const i = op.makeAsyncIterable(toIterator(a));
        const r: typeof a = [];
        for await (const v of i) {
            r.push(v);
        }
        expect(r).toEqual(a);
    });

    test('makeAsyncIterable from Iterator', async () => {
        const a = [1, 2, 3];
        const i = op.makeAsyncIterable(toAsyncIterable(a));
        const r: typeof a = [];
        for await (const v of i) {
            r.push(v);
        }
        expect(r).toEqual(a);
    });

    test('reduce', () => {
        const fn = (a: number, b: number) => a + b;
        const a = [1, 2, 3];
        expect(op.reduce(fn, undefined, a)).toBe(6);
        expect(op.reduce(fn, 10, a)).toBe(16);
        expect(op.reduce(fn, undefined, toIterable(a))).toBe(6);
        expect(op.reduce(fn, 10, toIterable(a))).toBe(16);
    });

    test('reduceAsync', async () => {
        const fn = (a: number, b: number) => a + b;
        const a = [1, 2, 3];
        expect(await op.reduceAsync(fn, a, undefined)).toBe(6);
        expect(await op.reduceAsync(fn, a, 10)).toBe(16);
        expect(await op.reduceAsync(fn, toIterable(a), undefined)).toBe(6);
        expect(await op.reduceAsync(fn, toIterable(a), 10)).toBe(16);
    });

    test('reduceAsyncForAsyncIterator', async () => {
        const fn = (a: number, b: number) => a + b;
        const a = [1, 2, 3];
        const b: Iterable<number> = a;
        expect(await op.reduceAsyncForAsyncIterator(fn, toAsyncIterable(a), undefined)).toBe(6);
        expect(await op.reduceAsyncForAsyncIterator(fn, toAsyncIterable(a), 10)).toBe(16);
        expect(await op.reduceAsyncForAsyncIterator(fn, op.makeAsyncIterable(a), undefined)).toBe(6);
        expect(await op.reduceAsyncForAsyncIterator(fn, op.makeAsyncIterable(b), 10)).toBe(16);
    });

    test('reduceAsync nested promise', async () => {
        const timeout = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
        const toPromise = <T>(i: T) => timeout(0).then(() => i);
        const a = [1, 2, 3];
        const p = a.map(toPromise);
        const pp = p.map(toPromise);
        const r = await op.reduceAsync((a, b) => a + b, pp, 1);
        expect(r).toBe(7);
    });
});

function *forceIterable<T>(i: Iterable<T> | IterableIterator<T>): IterableIterator<T> {
    yield *i;
}

function* fib() {
    let [a, b] = [0, 1];
    while (true) {
        yield b;
        [a, b] = [b, a + b];
    }
}

function toIterable<T>(a: T[]): Iterable<T> {
    let i = 0;
    let used = false;
    const next = () => ({
        done: i >= a.length,
        value: a[i++]
    })
    const iterator = () => {
        if (used) {
            throw 'Iterator Retry Error'
        }
        used = true;
        return { next };
    };
    return {
        [Symbol.iterator]: iterator
    }
}

function toAsyncIterable<T>(a: T[]): AsyncIterable<T> {
    let i = 0;
    let used = false;
    const next = () => Promise.resolve({
        done: i >= a.length,
        value: a[i++]
    });
    const iterator = () => {
        if (used) {
            throw 'Iterator Retry Error'
        }
        used = true;
        return { next };
    };
    return {
        [Symbol.asyncIterator]: iterator
    }
}
