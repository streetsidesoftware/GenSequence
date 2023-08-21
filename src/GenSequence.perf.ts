import { describe, expect, test } from 'vitest';
import * as GS from './GenSequence.js';
import { builder } from './index.js';

const timeout = 100000;

describe('Performance Test', () => {
    test(
        'Simple Generator to an array',
        () => {
            const fnBase = () => {
                return [...range(0, 10000)];
            };

            const fnExp = () => {
                return GS.genSequence(range(0, 10000)).toArray();
            };
            const rBase = measure(fnBase, 100);
            const rExp = measure(fnExp, 100);

            expect(rExp.result).toEqual(rBase.result);
            assertExpectedRatio('Simple Generator to an array', rBase, rExp, 1.2);
        },
        { timeout },
    );

    test(
        'filter filter reduce',
        () => {
            const getValues = () => range(0, 100000);
            const fnBase = () => {
                return [...getValues()]
                    .filter((a) => !!(a & 1))
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };

            const fnExp = () => {
                return GS.genSequence(getValues())
                    .filter((a) => !!(a & 1))
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };
            const rBase = measure(fnBase, 10);
            const rExp = measure(fnExp, 10);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('filter filter reduce', rBase, rExp, 1.4);
        },
        { timeout },
    );

    test(
        'filter slice filter reduce',
        () => {
            const getValues = () => range(0, 100000);
            const fnBase = () => {
                return [...getValues()]
                    .filter((a) => !!(a & 1))
                    .slice(1000)
                    .slice(0, 10000)
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };

            const fnExp = () => {
                return GS.genSequence(getValues())
                    .filter((a) => !!(a & 1))
                    .skip(1000)
                    .take(10000)
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };
            const rBase = measure(fnBase, 10);
            const rExp = measure(fnExp, 10);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('filter slice filter reduce', rBase, rExp, 1);
        },
        { timeout },
    );

    test(
        'filter slice filter reduce (1000)',
        () => {
            const getValues = () => range(0, 1000);
            const fnBase = () => {
                return [...getValues()]
                    .filter((a) => !!(a & 1))
                    .slice(100)
                    .slice(0, 500)
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };

            const fnExp = () => {
                return GS.genSequence(getValues())
                    .filter((a) => !!(a & 1))
                    .skip(100)
                    .take(500)
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };
            const rBase = measure(fnBase, 1000);
            const rExp = measure(fnExp, 1000);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('filter slice filter reduce (1000)', rBase, rExp, 2, 3);
        },
        { timeout },
    );

    test(
        'builder filter slice filter reduce (1000)',
        () => {
            const getValues = () => range(0, 1000);
            const fnBase = () => {
                return [...getValues()]
                    .filter((a) => !!(a & 1))
                    .slice(100)
                    .slice(0, 500)
                    .filter((a) => !!(a & 2))
                    .reduce((a, b) => a + b);
            };

            const fnExp = () =>
                builder
                    .filter<number>((a) => !!(a & 1))
                    .skip(100)
                    .take(500)
                    .filter((a) => !!(a & 2))
                    .build(getValues())
                    .reduce((a, b) => a + b);
            const rBase = measure(fnBase, 1000);
            const rExp = measure(fnExp, 1000);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('builder filter slice filter reduce (1000)', rBase, rExp, 2, 3);
        },
        { timeout },
    );

    test(
        'filter slice filter first (1000)',
        () => {
            const getValues = () => range(0, 1000);
            const fnBase = () => {
                return [...getValues()]
                    .filter((a) => !!(a & 1))
                    .slice(100)
                    .slice(0, 500)
                    .filter((a) => !!(a & 2))
                    .filter((a) => !!(a & 200))
                    .shift();
            };

            const fnExp = () => {
                return GS.genSequence(getValues())
                    .filter((a) => !!(a & 1))
                    .skip(100)
                    .take(500)
                    .filter((a) => !!(a & 2))
                    .filter((a) => !!(a & 200))
                    .first();
            };
            const rBase = measure(fnBase, 1000);
            const rExp = measure(fnExp, 1000);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('filter slice filter first (1000)', rBase, rExp, 0.5);
        },
        { timeout },
    );

    test(
        'concatMap',
        () => {
            const getValues = () => range(0, 100);
            const getNested = () => range(0, 1000);
            const fnBase = () => {
                return [...getValues()]
                    .map(() => [...getNested()])
                    .reduce((a, b) => a.concat(b))
                    .filter((a) => !!(a & 1))
                    .map((a) => a + 10)
                    .filter((a) => a < 500)
                    .slice(100)
                    .slice(0, 10000)
                    .reduce((a, b) => a + b);
            };

            const fnExp = () => {
                return GS.genSequence(getValues())
                    .concatMap(() => getNested())
                    .filter((a) => !!(a & 1))
                    .map((a) => a + 10)
                    .filter((a) => a < 500)
                    .skip(100)
                    .take(10000)
                    .reduce((a, b) => a + b);
            };
            const rBase = measure(fnBase, 100);
            const rExp = measure(fnExp, 100);

            expect(rExp.result).toBe(rBase.result);
            assertExpectedRatio('concatMap', rBase, rExp, 1);
        },
        { timeout },
    );
});

function* range(start: number, stop: number, step?: number) {
    const diff = stop - start;
    const delta = diff / Math.abs(diff || 1);
    step = step || delta;
    for (let i = start; i < stop; i += step) {
        yield i;
    }
}

interface Measurement<T> {
    result: T | undefined;
    avg: number;
    min: number | undefined;
    max: number | undefined;
    count: number;
}

function measure<T>(fn: () => T, count = 1): Measurement<T> {
    let sum = 0;
    count = Math.max(count, 1);
    const measurement: Measurement<T> = {
        result: undefined,
        avg: 0,
        min: undefined,
        max: undefined,
        count,
    };
    for (let i = 0; i < count; ++i) {
        const t = process.hrtime();
        measurement.result = fn();
        const elapsed = toMs(process.hrtime(t));
        sum += elapsed;
        measurement.min = Math.min(measurement.min || elapsed, elapsed);
        measurement.max = Math.max(measurement.max || elapsed, elapsed);
    }
    measurement.avg = sum / count;
    return measurement;
}

function toMs(diff: [number, number]) {
    return diff[0] * 1e3 + diff[1] / 1e6;
}

function assertExpectedRatio<T>(testName: string, base: Measurement<T>, comp: Measurement<T>, expectedRatio: number, failRatio?: number) {
    console.log(testName + compareMeasurementsToString(base, comp, expectedRatio));
    const ratio = comp.avg / base.avg;
    expect(ratio).toBeLessThan(failRatio ?? expectedRatio);
}

function compareMeasurementsToString<T>(base: Measurement<T>, comp: Measurement<T>, expectedRatio: number): string {
    function fix(n: number | undefined) {
        if (n === undefined) {
            return '-';
        }
        return n.toFixed(3);
    }
    const ratio = (comp.avg || 0) / (base.avg || 1);
    return `
\t\tbase\tcomp
avg:\t${fix(base.avg)}\t${fix(comp.avg)}
min:\t${fix(base.min)}\t${fix(comp.min)}
max:\t${fix(base.max)}\t${fix(comp.max)}
cnt:\t${base.count}\t${comp.count}
ratio:\t${fix(expectedRatio)}\t${fix(ratio)}\t${ratio <= expectedRatio ? 'PASS' : 'FAIL'}
`;
}
