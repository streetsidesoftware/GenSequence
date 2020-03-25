import { pipe, map } from './operators';

describe('Validate Operators', () => {
    const fnNumToString = map((n: number) => n.toString());
    const fnAdd = (a: number) => ((n: number) => n + a);
    const fnAddOne = map((n: number) => n + 1);
    const fnConcatString = (s: string) => map((v: string) => v + s);
    const fnStrToInt = map((s: string) => parseInt(s));

    test('pipe', () => {
        const fn = pipe(
            fnNumToString,
            fnConcatString('0'),
            fnStrToInt,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(a => a * 10));
    });

    test('pipe 0', () => {
        const fn = pipe();
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples);
    });

    test('pipe 1', () => {
        const n = 1;
        const fn = pipe(
            fnAddOne
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(fnAdd(n)));
    });

    test('pipe 2', () => {
        const n = 2;
        const fn = pipe(
            fnAddOne,
            fnAddOne,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(fnAdd(n)));
    });

    test('pipe 3', () => {
        const n = 3;
        const fn = pipe(
            fnAddOne,
            fnAddOne,
            fnAddOne,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(fnAdd(n)));
    });

    test('pipe 4', () => {
        const n = 4;
        const fn = pipe(
            fnAddOne,
            fnAddOne,
            fnAddOne,
            fnAddOne,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(fnAdd(n)));
    });

    test('pipe 5', () => {
        const n = 5;
        const fn = pipe(
            fnAddOne,
            fnAddOne,
            fnAddOne,
            fnAddOne,
            fnAddOne,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(fnAdd(n)));
    });

    test('pipe different types', () => {
        const fn = pipe(
            fnAddOne,
            fnNumToString,
            fnConcatString('0'),
            fnConcatString('1'),
            fnStrToInt,
        );
        const samples = [1, 2, 3, 4, 5];
        expect([...fn(samples)]).toEqual(samples.map(n => n * 100 + 101));
    });

    test('pipe returns the item if a function is falsy', () => {
        // as types is just runtime sometimes the function can be null
        const fn = pipe(
            0 as any,
            null as any,
            undefined as any,
            false as any,
            NaN as any,
            fnAddOne,
        );
        const samples = [1, 2];

        expect([...fn(samples)]).toEqual([2, 3]);
    })
});
