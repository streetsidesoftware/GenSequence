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
        const i = op.makeIterable(a[Symbol.iterator]());
        expect([...i,...i]).toEqual(a);
    });

    test('makeIterable from Iterator', () => {
        const a = [1, 2, 3];
        const i = op.makeIterable(toIterator(a));
        expect([...i,...i]).toEqual(a);
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
