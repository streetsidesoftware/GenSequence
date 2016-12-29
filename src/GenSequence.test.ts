import { genSequence, objectToSequence } from './GenSequence';
import { expect } from 'chai';

describe('GenSequence Tests', function() {
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
        const result = gs.reduceToSequence<number>((a: Set<number>, v) => a.add(v), new Set<number>());
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
    });

    it('tests object to sequence', () => {
        const person = {
            name: 'Bob',
            age: 22,
            height: 185,
            weight: 87,
        }
        const i = objectToSequence(person);
        expect(i.map(kvp => kvp[0]).toArray().sort()).to.be.deep.equal(Object.keys(person).sort());
        const j = objectToSequence(person);
        expect(j.map(kvp => kvp[1]).toArray().sort()).to.be.deep.equal(Object.keys(person).map(k => person[k]).sort());
    });

    it('tests that a sequence is empty once it has been used', () => {
        const person = {
            name: 'Bob',
            age: 22,
            height: 185,
            weight: 87,
        }
        const i = objectToSequence(person);
        const j = genSequence(i);
        const values0 = j.toArray();
        const values1 = i.toArray();
        expect(values0).to.not.be.empty;
        expect(values1).to.be.empty;
        expect(values0).to.not.be.deep.equal(values1);
    });

    it('tests that a sequence can be reused if it is based upon an array', () => {
        const values = [1,2,3,4,5];
        const i = genSequence(values);
        expect(i.toArray()).to.be.deep.equal(i.toArray());
    });
});