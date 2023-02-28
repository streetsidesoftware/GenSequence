import { describe, expect, test } from 'vitest';
import { genSequence, sequenceFromObject, sequenceFromRegExpMatch, objectToSequence, Sequence } from './GenSequence.js';
import * as op from './operators/operatorsBase.js';
import * as o from './operators/index.js';

describe('GenSequence Tests', () => {
    interface Person {
        name: string;
        age: number;
        height: number;
        weight: number;
    }
    type PersonKeys = keyof Person;

    test('tests constructing GenSequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        expect(gs.toArray()).toEqual(values);
        // Try a second time.
        expect(gs.toArray()).toEqual(values);

        // empty sequence
        expect(genSequence([]).toArray()).toEqual([]);
    });

    test('tests mapping values', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.map((a) => 2 * a).toArray();
        expect(result).toEqual(values.map((a) => 2 * a));
    });

    test('tests filtering a sequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.filter((a) => a % 2 === 1).toArray();
        expect(result).toEqual(values.filter((a) => a % 2 === 1));
    });

    test('tests reducing a sequence w/o init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v);
        expect(result).toEqual(values.reduce((a, v) => a + v));
    });

    test('tests reducing a sequence with init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v, 0);
        expect(result).toEqual(values.reduce((a, v) => a + v, 0));
    });

    test('tests reducing a sequence with init to a different type', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        const result = gs.reduce<number[]>((a, v) => [...a, v], []);
        expect(result).toEqual(values);
    });

    test('tests reducing asynchronously a sequence w/o init', async () => {
        const values = [1, 2, 3, 4, 5].map((x) => Promise.resolve<number>(x));
        const gs = genSequence(values);
        const result = await gs.reduceAsync((a, v) => a + v);
        expect(result).toEqual(15);
    });

    test('tests reducing asynchronously a sequence with init', async () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = await gs.reduceAsync(async (a, v) => a + v, Promise.resolve(10));
        expect(result).toEqual(25);
    });

    test('tests reducing a sequence to a sequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        const result = gs.reduceToSequence<number>((a, v) => [...a, v], []);
        expect(result.toArray()).toEqual(values);
    });

    test('tests reducing a sequence to a Set to a sequence', () => {
        const values = [1, 2, 3, 3, 4, 5, 5];
        const gs = genSequence(values);
        const result = gs.reduceToSequence<number, Set<number>>((a, v) => a.add(v), new Set<number>());
        expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    test('tests combine', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = genSequence(a).combine((a, b) => '' + a + b, b);
        expect(gs.toArray()).toEqual(['1a', '2b', '3c']);
        const gs2 = genSequence(b).combine((a, b) => '' + a + (b || ''), a);
        expect(gs2.toArray()).toEqual(['a1', 'b2', 'c3', 'd']);
    });

    test('tests concat', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = genSequence(a)
            .map((a) => '' + a)
            .concat(b);
        expect(gs.toArray()).toEqual(['1', '2', '3', 'a', 'b', 'c', 'd']);
    });

    test('tests with maps', () => {
        const m = new Map([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
        const gs = genSequence(m);
        expect(gs.toArray()).toEqual([...m.entries()]);
        // Try a second time.
        expect(gs.toArray()).toEqual([...m.entries()]);

        const m2 = new Map(gs);
        expect([...m2.entries()]).toEqual([...m.entries()]);
    });

    test('tests with sets', () => {
        const s = new Set(['a', 'b', 'c']);
        const gs = genSequence(s);
        expect(gs.toArray()).toEqual([...s.keys()]);

        const s2 = new Set(gs);
        expect([...s2.entries()]).toEqual([...s.entries()]);
    });

    test('tests reUsing Sequences', () => {
        const values = [1, 2, 3];
        const gs = genSequence(values);
        const a = gs.map((a) => 2 * a);
        const b = gs.map((a) => 3 + a);
        expect(gs.toArray()).toEqual(values);
        expect(a.toArray()).toEqual([2, 4, 6]);
        expect(b.toArray()).toEqual([4, 5, 6]);
    });

    test('test concatMap', () => {
        const values = [1, 2, 3];
        const gs = genSequence(values).concatMap((a) => [a, a, a]);
        expect(gs.toArray()).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3]);
    });

    test('tests skip', () => {
        const values = [1, 2, 3, 4, 5];
        for (let i = 0; i < values.length + 2; ++i) {
            expect(genSequence(values).skip(i).toArray()).toEqual(values.slice(i));
        }
    });

    test('tests take', () => {
        const values = [1, 2, 3, 4, 5];
        for (let i = 0; i < values.length + 2; ++i) {
            expect(genSequence(values).take(i).toArray()).toEqual(values.slice(0, i));
        }
    });

    test('tests first', () => {
        const values = [1, 2, 3, 4, 5];
        expect(genSequence(values).first()).toBe(1);
        expect(genSequence(values).skip(2).first()).toBe(3);
        expect(genSequence(values).first((a) => a > 3.5)).toBe(4);
        expect(genSequence(values).first((a) => a > 100)).toBeUndefined();
        expect(genSequence(values).first((a) => a > 100, -1)).toBe(-1);
    });

    test('tests object to sequence', () => {
        const person: Person = {
            name: 'Bob',
            age: 22,
            height: 185,
            weight: 87,
        };
        const i = sequenceFromObject(person);
        const keys = Object.keys(person) as PersonKeys[];
        expect(
            i
                .map((kvp) => kvp[0])
                .toArray()
                .sort()
        ).toEqual(keys.sort());
        const j = sequenceFromObject(person);
        expect(
            j
                .map((kvp) => kvp[1])
                .toArray()
                .sort()
        ).toEqual(keys.map((k: PersonKeys) => person[k]).sort());
        expect([...objectToSequence(person)]).toEqual([...sequenceFromObject(person)]);
    });

    test('tests that a sequence can be reused if it is based upon an array', () => {
        const values = [1, 2, 3, 4, 5];
        const i = genSequence(values);
        expect(i.toArray()).toEqual(i.toArray());
    });

    test('tests sequenceFromRegExpMatch', () => {
        const tests: [RegExp, string, string[]][] = [
            [/a/, 'aaaa', ['a']],
            [/a/g, 'aaaa', ['a', 'a', 'a', 'a']],
            [/a/g, 'AAAA', []],
            [/a/gi, 'AAAA', ['A', 'A', 'A', 'A']],
            [/a/gi, 'AB\nA\nCA\nDA\n', ['A', 'A', 'A', 'A']],
            [/^.?a.?$/gim, 'AB\nA\nCA\nDA\n', ['AB', 'A', 'CA', 'DA']],
        ];
        tests.forEach((test) => {
            const [reg, str, expected] = test;
            const result = sequenceFromRegExpMatch(reg, str)
                .map((a) => a[0])
                .toArray();
            // test.toString()
            expect(result).toEqual(expected);
        });
    });

    test('test toIterator', () => {
        const seq = genSequence([1, 2, 3]);
        const result = [...seq.toIterable()];
        expect(result).toEqual([1, 2, 3]);
    });

    test('tests scan', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3])
            .scan(
                (acc, value) => {
                    const duplicate = acc.s.has(value);
                    acc.s.add(value);
                    return { value, duplicate, s: acc.s };
                },
                { value: 0, s: new Set<number>(), duplicate: true }
            )
            .filter((acc) => !acc.duplicate)
            .map((acc) => acc.value);
        const result = seq.toArray();
        expect(result).toEqual([1, 2, 3]);
    });

    test('tests scan -- running sum', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3]).scan((acc, value) => acc + value);
        const result = seq.toArray();
        expect(result).toEqual([1, 3, 4, 7, 9, 10, 13]);
    });

    test('tests scanMap -- running sum', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3]).map(op.scanMap<number>((acc, value) => acc + value));
        const result = seq.toArray();
        expect(result).toEqual([1, 3, 4, 7, 9, 10, 13]);
    });

    test('tests scan with no values', () => {
        // let only the first occurrence of a value through.
        const values: number[] = [];
        const seq = genSequence(values).scan((acc, value) => acc + value);
        const result = seq.toArray();
        expect(result).toEqual([]);
    });

    test('test getting the iterator from a sequence', () => {
        const values = [1, 2, 3, 4];
        expect([...op.makeIterable(genSequence(values)[Symbol.iterator]())]).toEqual(values);
        expect([...op.makeIterable(genSequence(values))]).toEqual(values);
    });

    test('test reusing getting the iterator from a sequence', () => {
        const values = [1, 2, 3, 4];
        const sequence: Sequence<number> = genSequence(values).map((n) => n);
        // do it twice as an iterable
        expect([...op.makeIterable(sequence[Symbol.iterator]())]).toEqual(values);
        expect([...op.makeIterable(sequence[Symbol.iterator]())]).toEqual(values);

        // do it twice as an iterator
        expect([...op.makeIterable(genSequence(values))]).toEqual(values);
        expect([...op.makeIterable(genSequence(values))]).toEqual(values);
    });

    test('test any with match', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).any((a) => a > 3)).toBe(true);
    });

    test('test any with no match', () => {
        const values = [0, 1, 2, 3];
        expect(genSequence(values).any((a) => a > 3)).toBe(false);
    });

    test('test any with empty set', () => {
        const values: number[] = [];
        expect(genSequence(values).any((a) => a > 3)).toBe(false);
    });

    test('test any exits early', () => {
        const values = [1, 2, 3, 4];
        let count: number = 0;
        genSequence(values).any((a) => {
            count++;
            return a == 3;
        });
        expect(count).toBe(3);
    });

    test('test all where all values match', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).all((a) => a >= 0)).toBe(true);
    });

    test('test all with one value that does not match', () => {
        const values = [0, 1];
        expect(genSequence(values).all((a) => a != 1)).toBe(false);
    });

    test('test all with empty set', () => {
        const values: number[] = [];
        expect(genSequence(values).all((a) => a > 3)).toBe(true);
    });

    test('test all exits early', () => {
        const values = [1, 2, 3, 4];
        let count: number = 0;
        genSequence(values).all((a) => {
            count++;
            return a < 3;
        });
        expect(count).toBe(3);
    });

    test('test max on single value', () => {
        const values = [2];
        expect(genSequence(values).max()).toBe(2);
    });

    test('test max returns max on start', () => {
        const values = [4, 3, 2, 1];
        expect(genSequence(values).max()).toBe(4);
    });

    test('test max returns max in middle', () => {
        const values = [1, 3, 1];
        expect(genSequence(values).max()).toBe(3);
    });

    test('test max returns max on end', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).max()).toBe(4);
    });

    test('test max on empty set returns undefined', () => {
        const values: number[] = [];
        expect(genSequence(values).max()).toBeUndefined();
    });

    test('test max on string values', () => {
        const values = ['one', 'two'];
        expect(genSequence(values).max()).toBe('two');
    });

    test('test max on object values', () => {
        const smaller: any = {
            valueOf: function () {
                return 1;
            },
        };
        const bigger: any = {
            valueOf: function () {
                return 2;
            },
        };
        const values = [smaller, bigger];
        expect(genSequence(values).max()).toBe(bigger);
    });

    test('test max starts with undefined always undefined', () => {
        const values = [undefined, 1, undefined, 2];
        expect(genSequence(values).max()).toBeUndefined();
    });

    test('test max undefined value', () => {
        const values = [1, undefined, 2, undefined];
        expect(genSequence(values).max()).toBe(2);
    });

    test('test max null value', () => {
        const values = [null, 1, null, 2];
        expect(genSequence(values).max()).toBe(2);
    });

    test('test max starts with NaN always NaN', () => {
        const values = [NaN, 1, NaN, 2];
        expect(genSequence(values).max()).toBeNaN();
    });

    test('test max NaN value', () => {
        const values = [1, NaN, 2];
        expect(genSequence(values).max()).toBe(2);
    });

    test('test max all undefined value', () => {
        const values = [undefined, undefined];
        expect(genSequence(values).max()).toBeUndefined();
    });

    test('test max all null value', () => {
        const values = [null, null];
        expect(genSequence(values).max()).toBeNull();
    });

    test('test max all NaN value', () => {
        const values = [NaN, NaN];
        expect(genSequence(values).max()).toBeNaN();
    });

    test('test max with selector', () => {
        const one: any = {
            age: 1,
            animal: 'zebra',
        };
        const two: any = {
            age: 2,
            animal: 'alligator',
        };
        const values = [one, two];
        expect(genSequence(values).max((v) => v.age)).toBe(two);
        expect(genSequence(values).max((v) => v.animal)).toBe(one);
    });

    test('test min on single value', () => {
        const values = [2];
        expect(genSequence(values).min()).toBe(2);
    });

    test('test min returns min on start', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).min()).toBe(1);
    });

    test('test min returns min in middle', () => {
        const values = [3, 1, 3];
        expect(genSequence(values).min()).toBe(1);
    });

    test('test min returns min on end', () => {
        const values = [4, 3, 2, 1];
        expect(genSequence(values).min()).toBe(1);
    });

    test('test min on empty set returns undefined', () => {
        const values: number[] = [];
        expect(genSequence(values).min()).toBeUndefined();
    });

    test('test min on string values', () => {
        const values = ['one', 'two'];
        expect(genSequence(values).min()).toBe('one');
    });

    test('test min on object values', () => {
        const smaller: any = {
            valueOf: function () {
                return 1;
            },
        };
        const bigger: any = {
            valueOf: function () {
                return 2;
            },
        };
        const values = [smaller, bigger];
        expect(genSequence(values).min()).toBe(smaller);
    });

    test('test min starts with undefined always undefined', () => {
        const values = [undefined, 1, undefined, 2];
        expect(genSequence(values).min()).toBeUndefined();
    });

    test('test min undefined value', () => {
        const values = [2, undefined, 1, undefined];
        expect(genSequence(values).min()).toBe(1);
    });

    test('test min null value', () => {
        const values = [null, 1, null, 2];
        expect(genSequence(values).min()).toBeNull();
    });

    test('test min starts with NaN always NaN', () => {
        const values = [NaN, 1, NaN, 2];
        expect(genSequence(values).min()).toBeNaN();
    });

    test('test min NaN value', () => {
        const values = [1, NaN, 2];
        expect(genSequence(values).min()).toBe(1);
    });

    test('test min all undefined value', () => {
        const values = [undefined, undefined];
        expect(genSequence(values).min()).toBeUndefined();
    });

    test('test min all null value', () => {
        const values = [null, null];
        expect(genSequence(values).min()).toBeNull();
    });

    test('test min all NaN value', () => {
        const values = [NaN, NaN];
        expect(genSequence(values).min()).toBeNaN();
    });

    test('test min with selector', () => {
        const one: any = {
            age: 1,
            animal: 'zebra',
        };
        const two: any = {
            age: 2,
            animal: 'alligator',
        };
        const values = [one, two];
        expect(genSequence(values).min((v) => v.age)).toBe(one);
        expect(genSequence(values).min((v) => v.animal)).toBe(two);
    });

    test('test count with no elements', () => {
        const values: number[] = [];
        expect(genSequence(values).count()).toBe(0);
    });

    test('test count with 1 element', () => {
        const values: number[] = [1];
        expect(genSequence(values).count()).toBe(1);
    });

    test('test count with 2 elements', () => {
        const values: number[] = [18, 7];
        expect(genSequence(values).count()).toBe(2);
    });

    test('count twice on same array sequence', () => {
        const values = [1, 2, 3, 4, 5, 6];
        const seq = genSequence(values);
        const firstCount = seq.count();
        const secondCount = seq.count();
        expect(firstCount).toBe(secondCount);
    });

    test('count twice on same generated sequence', () => {
        const values = [1, 2, 3, 4, 5, 6];
        const filteredSequence = genSequence(values).filter((a) => !!(a % 2));
        const firstCount = filteredSequence.count();
        const secondCount = filteredSequence.count();
        expect(firstCount).toBe(secondCount);
    });

    test('demonstrate that it is not possible to re-use iterators', () => {
        const iter = fib();
        const seq = genSequence(iter);
        const fib5 = seq.skip(5).first();
        const fib5b = seq.skip(5).first();
        expect(fib5).toBe(8);
        // Try reusing the iterator.
        expect(fib5b).toBeUndefined();
    });

    test('tests forEach', () => {
        const values = [1, 2, 3, 4, 5, 60];
        const seq = genSequence(values);
        const expected = [
            [0, 1],
            [1, 2],
            [2, 3],
            [3, 4],
            [4, 5],
            [5, 60],
        ];
        let results: [number, number][] = [];
        seq.forEach((v, i) => results.push([i, v]));
        expect(results).toEqual(expected);
    });

    test('tests Sequence.next', () => {
        const values = [...genSequence(fib()).take(5)];
        const i = genSequence(values);
        const result = [];
        for (let r = i.next(); !r.done; r = i.next()) {
            r.done || result.push(r.value);
        }
        expect(result).toEqual(values);
    });

    test('pipe', () => {
        const values = [...genSequence(fib()).take(5)];
        expect([...genSequence(values).pipe()]).toEqual(values);
        const seq = genSequence(values).pipe(
            o.map((n) => n * 2),
            o.map((n) => n.toString()),
            o.map((s) => s + '0'),
            o.map((s) => parseInt(s))
        );
        expect([...seq]).toEqual(values.map((v) => v * 20));
    });
});

function* fib() {
    let [a, b] = [0, 1];
    while (true) {
        yield b;
        [a, b] = [b, a + b];
    }
}
