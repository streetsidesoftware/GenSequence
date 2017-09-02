import { genSequence, sequenceFromObject, sequenceFromRegExpMatch } from './GenSequence';
import * as GS from './GenSequence';
import { expect } from 'chai';

describe('GenSequence Tests', function() {

    interface Person {
        name: string,
        age: number,
        height: number,
        weight: number,
    }
    type PersonKeys = keyof Person;

    it('tests constructing GenSequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        expect(gs.toArray()).to.deep.equal(values);
        // Try a second time.
        expect(gs.toArray()).to.deep.equal(values);

        // empty sequence
        expect(genSequence([]).toArray()).to.deep.equal([]);
    });

    it('tests mapping values', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.map(a => 2 * a).toArray();
        expect(result).to.deep.equal(values.map(a => 2 * a));
    });

    it('tests filtering a sequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.filter(a => a % 2 === 1).toArray();
        expect(result).to.deep.equal(values.filter(a => a % 2 === 1));
    });

    it('tests reducing a sequence w/o init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v);
        expect(result).to.deep.equal(values.reduce((a, v) => a + v));
    });

    it('tests reducing a sequence with init', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values[Symbol.iterator]());
        const result = gs.reduce((a, v) => a + v, 0);
        expect(result).to.deep.equal(values.reduce((a, v) => a + v, 0));
    });

    it('tests reducing a sequence with init to a different type', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        const result = gs.reduce<number[]>((a, v) => [...a, v], []);
        expect(result).to.deep.equal(values);
    });

    it('tests reducing a sequence to a sequence', () => {
        const values = [1, 2, 3, 4, 5];
        const gs = genSequence(values);
        const result = gs.reduceToSequence<number>((a, v) => [...a, v], []);
        expect(result.toArray()).to.deep.equal(values);
    });

    it('tests reducing a sequence to a Set to a sequence', () => {
        const values = [1, 2, 3, 3, 4, 5, 5];
        const gs = genSequence(values);
        const result = gs.reduceToSequence<number, Set<number>>((a, v) => a.add(v), new Set<number>());
        expect(result.toArray()).to.deep.equal([1, 2, 3, 4, 5]);
    });

    it('tests combine', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = genSequence(a).combine((a, b) => '' + a + b, b);
        expect(gs.toArray()).to.be.deep.equal(['1a', '2b', '3c']);
        const gs2 = genSequence(b).combine((a, b) => '' + a + (b || ''), a);
        expect(gs2.toArray()).to.be.deep.equal(['a1', 'b2', 'c3', 'd']);
    });

    it('tests concat', () => {
        const a = [1, 2, 3];
        const b = ['a', 'b', 'c', 'd'];
        const gs = genSequence(a).map(a => '' + a).concat(b);
        expect(gs.toArray()).to.be.deep.equal(['1', '2', '3', 'a', 'b', 'c', 'd']);
    });


    it('tests with maps', () => {
        const m = new Map([['a', 1], ['b', 2], ['c', 3]]);
        const gs = genSequence(m);
        expect(gs.toArray()).to.be.deep.equal([...m.entries()]);
        // Try a second time.
        expect(gs.toArray()).to.be.deep.equal([...m.entries()]);

        const m2 = new Map(gs);
        expect([...m2.entries()]).to.be.deep.equal([...m.entries()]);
    });

    it('tests with sets', () => {
        const s = new Set(['a', 'b', 'c']);
        const gs = genSequence(s);
        expect(gs.toArray()).to.be.deep.equal([...s.keys()]);

        const s2 = new Set(gs);
        expect([...s2.entries()]).to.be.deep.equal([...s.entries()]);
    });

    it('tests reUsing Sequences', () => {
        const values = [1, 2, 3];
        const gs = genSequence(values);
        const a = gs.map(a => 2 * a);
        const b = gs.map(a => 3 + a);
        expect(gs.toArray()).to.deep.equal(values);
        expect(a.toArray()).to.deep.equal([2, 4, 6]);
        expect(b.toArray()).to.deep.equal([4, 5, 6]);
    });

    it('test concatMap', () => {
        const values = [1, 2, 3];
        const gs = genSequence(values).concatMap(a => [a, a, a]);
        expect(gs.toArray()).to.deep.equal([1, 1, 1, 2, 2, 2, 3, 3, 3]);
    });

    it('tests skip', () => {
        const values = [1, 2, 3, 4, 5];
        for (let i = 0; i < values.length + 2; ++i) {
            expect(genSequence(values).skip(i).toArray()).to.deep.equal(values.slice(i));
        }
    });

    it('tests take', () => {
        const values = [1, 2, 3, 4, 5];
        for (let i = 0; i < values.length + 2; ++i) {
            expect(genSequence(values).take(i).toArray()).to.deep.equal(values.slice(0, i));
        }
    });

    it('tests first', () => {
        const values = [1, 2, 3, 4, 5];
        expect(genSequence(values).first()).to.be.equal(1);
        expect(genSequence(values).skip(2).first()).to.be.equal(3);
        expect(genSequence(values).first(a => a > 3.5)).to.be.equal(4);
        expect(genSequence(values).first(a => a > 100)).to.be.undefined;
        expect(genSequence(values).first(a => a > 100, -1)).to.be.equal(-1);
    });

    it('tests object to sequence', () => {
        const person: Person = {
            name: 'Bob',
            age: 22,
            height: 185,
            weight: 87,
        }
        const i = sequenceFromObject(person);
        expect(i.map(kvp => kvp[0]).toArray().sort()).to.be.deep.equal(Object.keys(person).sort());
        const j = sequenceFromObject(person);
        expect(j.map(kvp => kvp[1]).toArray().sort()).to.be.deep.equal(Object.keys(person).map((k: PersonKeys) => person[k]).sort());
        expect([...GS.objectToSequence(person)]).to.be.deep.equal([...sequenceFromObject(person)]);
    });

    it('tests that a sequence can be reused if it is based upon an array', () => {
        const values = [1,2,3,4,5];
        const i = genSequence(values);
        expect(i.toArray()).to.be.deep.equal(i.toArray());
    });

    it('tests sequenceFromRegExpMatch', () => {
        const tests: [RegExp, string, string[]][] = [
            [/a/, 'aaaa', ['a']],
            [/a/g, 'aaaa', ['a', 'a', 'a', 'a']],
            [/a/g, 'AAAA', []],
            [/a/gi, 'AAAA', ['A', 'A', 'A', 'A']],
            [/a/gi, 'AB\nA\nCA\nDA\n', ['A', 'A', 'A', 'A']],
            [/^.?a.?$/gim, 'AB\nA\nCA\nDA\n', ['AB', 'A', 'CA', 'DA']],
        ]
        tests.forEach(test => {
            const [reg, str, expected] = test;
            const result = sequenceFromRegExpMatch(reg, str).map(a => a[0]).toArray();
            expect(result, test.toString()).to.deep.equal(expected);
        });
    });

    it('test toIterator', () => {
        const seq = genSequence([1, 2, 3]);
        const result = [...seq.toIterable()];
        expect(result).to.deep.equal([1, 2, 3]);
    });

    it('tests scan', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3])
            .scan((acc, value) => {
                const duplicate = acc.s.has(value);
                acc.s.add(value);
                return {value, duplicate, s: acc.s};
            }, {value: 0, s: new Set<number>(), duplicate: true})
            .filter(acc => !acc.duplicate)
            .map(acc => acc.value);
        const result = seq.toArray();
        expect(result).to.be.deep.equal([1, 2, 3]);
    });

    it('tests scan -- running sum', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3])
            .scan((acc, value) => acc + value);
        const result = seq.toArray();
        expect(result).to.be.deep.equal([1, 3, 4, 7, 9, 10, 13]);
    });

    it('tests scanMap -- running sum', () => {
        // let only the first occurrence of a value through.
        const seq = genSequence([1, 2, 1, 3, 2, 1, 3])
        .map(GS.scanMap<number>((acc, value) => acc + value));
        const result = seq.toArray();
        expect(result).to.be.deep.equal([1, 3, 4, 7, 9, 10, 13]);
    });

    it('tests scan with no values', () => {
        // let only the first occurrence of a value through.
        const values: number[] = [];
        const seq = genSequence(values)
            .scan((acc, value) => acc + value);
        const result = seq.toArray();
        expect(result).to.be.deep.equal([]);
    });

    it('test the curring part of GS.map', () => {
        const fnMap = GS.map((a: number) => 2 * a);
        expect(fnMap).to.be.instanceof(Function);
        expect([...fnMap([1, 2, 3])]).deep.equal([2, 4, 6]);
    });

    it('test getting the iterator from a sequence', () => {
        const values = [1, 2, 3, 4];
        expect([...GS.makeIterable(genSequence(values)[Symbol.iterator]())]).to.be.deep.equal(values);
        expect([...GS.makeIterable(genSequence(values))]).to.be.deep.equal(values);
    });

    it('test reusing getting the iterator from a sequence', () => {
        const values = [1, 2, 3, 4];
        const sequence: GS.Sequence<number> = genSequence(values).map(n => n);
        // do it twice as an iterable
        expect([...GS.makeIterable(sequence[Symbol.iterator]())]).to.be.deep.equal(values);
        expect([...GS.makeIterable(sequence[Symbol.iterator]())]).to.be.deep.equal(values);

        // do it twice as an iterator
        expect([...GS.makeIterable(genSequence(values))]).to.be.deep.equal(values);
        expect([...GS.makeIterable(genSequence(values))]).to.be.deep.equal(values);
    });

    it('test any with match', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).any(a => a > 3)).to.be.true;
    });

    it('test any with no match', () => {
        const values = [0, 1, 2, 3];
        expect(genSequence(values).any(a => a > 3)).to.be.false;
    });

    it('test any with empty set', () => {
        const values: number[] = [];
        expect(genSequence(values).any(a => a > 3)).to.be.false;
    });

    it('test any exits early', () => {
        const values = [1, 2, 3, 4];
        let count: number = 0;
        genSequence(values).any(a => {
            count++;
            return a == 3;
        });
        expect(count).to.be.equal(3);
    });

    it('test all where all values match', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).all(a => a >= 0)).to.be.true;
    });

    it('test all with one value that does not match', () => {
        const values = [0, 1];
        expect(genSequence(values).all(a => a != 1)).to.be.false;
    });

    it('test all with empty set', () => {
        const values: number[] = [];
        expect(genSequence(values).all(a => a > 3)).to.be.true;
    });

    it('test all exits early', () => {
        const values = [1, 2, 3, 4];
        let count: number = 0;
        genSequence(values).all(a => {
            count++;
            return a < 3;
        });
        expect(count).to.be.equal(3);
    });

    it('test max on single value', () => {
        const values = [2];
        expect(genSequence(values).max()).to.equal(2);
    });

    it('test max returns max on start', () => {
        const values = [4, 3, 2, 1];
        expect(genSequence(values).max()).to.equal(4);
    });

    it('test max returns max in middle', () => {
        const values = [1, 3, 1];
        expect(genSequence(values).max()).to.equal(3);
    });

    it('test max returns max on end', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).max()).to.equal(4);
    });

    it('test max on empty set returns undefined', () => {
        const values: number[] = [];
        expect(genSequence(values).max()).to.be.undefined
    });

    it('test max on string values', () => {
        const values = ["one", "two"];
        expect(genSequence(values).max()).to.equal("two");
    });

    it('test max on object values', () => {
        const smaller: any = {
            valueOf: function() { return 1; }
        };
        const bigger: any = {
            valueOf: function() { return 2; }
        };
        const values = [smaller, bigger];
        expect(genSequence(values).max()).to.equal(bigger);
    });

    it('test max starts with undefined always undefined', () => {
        const values = [undefined, 1, undefined, 2];
        expect(genSequence(values).max()).to.be.undefined;
    });

    it('test max undefined value', () => {
        const values = [1, undefined, 2, undefined];
        expect(genSequence(values).max()).to.equal(2);
    });

    it('test max null value', () => {
        const values = [null, 1, null, 2];
        expect(genSequence(values).max()).to.equal(2);
    });

    it('test max starts with NaN always NaN', () => {
        const values = [NaN, 1, NaN, 2];
        expect(genSequence(values).max()).to.be.NaN;
    });

    it('test max NaN value', () => {
        const values = [1, NaN, 2];
        expect(genSequence(values).max()).to.equal(2);
    });

    it('test max all undefined value', () => {
        const values = [undefined, undefined];
        expect(genSequence(values).max()).to.be.undefined;
    });

    it('test max all null value', () => {
        const values = [null, null];
        expect(genSequence(values).max()).to.be.null;
    });

    it('test max all NaN value', () => {
        const values = [NaN, NaN];
        expect(genSequence(values).max()).to.be.NaN;
    });

    it('test max with selector', () => {
        const one: any = {
            age: 1,
            animal: "zebra"
        };
        const two: any = {
            age: 2,
            animal: "alligator"
        };
        const values = [one, two];
        expect(genSequence(values).max((v) => v.age)).to.equal(two);
        expect(genSequence(values).max((v) => v.animal)).to.equal(one);
    });

    it('test min on single value', () => {
        const values = [2];
        expect(genSequence(values).min()).to.equal(2);
    });

    it('test min returns min on start', () => {
        const values = [1, 2, 3, 4];
        expect(genSequence(values).min()).to.equal(1);
    });

    it('test min returns min in middle', () => {
        const values = [3, 1, 3];
        expect(genSequence(values).min()).to.equal(1);
    });

    it('test min returns min on end', () => {
        const values = [4, 3, 2, 1];
        expect(genSequence(values).min()).to.equal(1);
    });

    it('test min on empty set returns undefined', () => {
        const values: number[] = [];
        expect(genSequence(values).min()).to.be.undefined
    });

    it('test min on string values', () => {
        const values = ["one", "two"];
        expect(genSequence(values).min()).to.equal("one");
    });

    it('test min on object values', () => {
        const smaller: any = {
            valueOf: function() { return 1; }
        };
        const bigger: any = {
            valueOf: function() { return 2; }
        };
        const values = [smaller, bigger];
        expect(genSequence(values).min()).to.equal(smaller);
    });

    it('test min starts with undefined always undefined', () => {
        const values = [undefined, 1, undefined, 2];
        expect(genSequence(values).min()).to.be.undefined;
    });

    it('test min undefined value', () => {
        const values = [2, undefined, 1, undefined];
        expect(genSequence(values).min()).to.equal(1);
    });

    it('test min null value', () => {
        const values = [null, 1, null, 2];
        expect(genSequence(values).min()).to.be.null;
    });

    it('test min starts with NaN always NaN', () => {
        const values = [NaN, 1, NaN, 2];
        expect(genSequence(values).min()).to.be.NaN;
    });

    it('test min NaN value', () => {
        const values = [1, NaN, 2];
        expect(genSequence(values).min()).to.equal(1);
    });

    it('test min all undefined value', () => {
        const values = [undefined, undefined];
        expect(genSequence(values).min()).to.be.undefined;
    });

    it('test min all null value', () => {
        const values = [null, null];
        expect(genSequence(values).min()).to.be.null;
    });

    it('test min all NaN value', () => {
        const values = [NaN, NaN];
        expect(genSequence(values).min()).to.be.NaN;
    });

    it('test min with selector', () => {
        const one: any = {
            age: 1,
            animal: "zebra"
        };
        const two: any = {
            age: 2,
            animal: "alligator"
        };
        const values = [one, two];
        expect(genSequence(values).min((v) => v.age)).to.equal(one);
        expect(genSequence(values).min((v) => v.animal)).to.equal(two);
    });

    it('test count with no elements', () => {
        const values: number[] = [];
        expect(genSequence(values).count()).to.equal(0);
    });

    it('test count with 1 element', () => {
        const values: number[] = [1];
        expect(genSequence(values).count()).to.equal(1);
    });

    it('test count with 2 elements', () => {
        const values: number[] = [18, 7];
        expect(genSequence(values).count()).to.equal(2);
    });

    it('count twice on same array sequence', () => {
        const values = [1, 2, 3, 4, 5, 6];
        const seq = genSequence(values);
        const firstCount = seq.count();
        const secondCount = seq.count();
        expect(firstCount).to.equal(secondCount);
    });

    it('count twice on same generated sequence', () => {
        const values = [1, 2, 3, 4, 5, 6];
        const filteredSequence = genSequence(values).filter(a => !!(a % 2));
        const firstCount = filteredSequence.count();
        const secondCount = filteredSequence.count();
        expect(firstCount).to.equal(secondCount);
    });

    it('demonstrate that it is not possible to re-use iterators', () => {
        const iter = fib();
        const seq = genSequence(iter);
        const fib5 = seq.skip(5).first();
        const fib5b = seq.skip(5).first();
        expect(fib5).to.be.equal(8);
        // Try reusing the iterator.
        expect(fib5b).to.be.undefined;
    });

    it('tests forEach', () => {
        const values = [1, 2, 3, 4, 5, 60];
        const seq = genSequence(values)
        const expected = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 60]];
        let results: [number, number][] = [];
        seq.forEach((v, i) => results.push([i, v]))
        expect(results).to.be.deep.equal(expected);
    });
});

function* fib() {
    let [a, b] = [0, 1];
    while (true) {
        yield b;
        [a, b] = [b, a + b];
    }
}
