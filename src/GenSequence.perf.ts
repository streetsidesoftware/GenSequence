import * as GS from './GenSequence';
import { expect } from 'chai';
import {ISuiteCallbackContext} from 'mocha';

describe('Performance Test', function(this: ISuiteCallbackContext) {
    this.timeout(100000);
    it('Simple Generator to an array', () => {
        const fnBase = () => {
            return [...range(0, 10000)]
        };

        const fnExp = () => {
            return GS.genSequence(range(0, 10000)).toArray();
        }
        const rBase = measure(fnBase, 100);
        const rExp = measure(fnExp, 100);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.deep.equal(rBase.result);
        console.log('Simple Generator to an array' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(1.2);
    });

    it('filter filter reduce', () => {
        const getValues = () => range(0, 100000);
        const fnBase = () => {
            return [...getValues()]
                .filter(a => !!(a & 1))
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        };

        const fnExp = () => {
            return GS.genSequence(getValues())
                .filter(a => !!(a & 1))
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        }
        const rBase = measure(fnBase, 10);
        const rExp = measure(fnExp, 10);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.equal(rBase.result);
        console.log('filter filter reduce' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(1.4);
    });

    it('filter slice filter reduce', () => {
        const getValues = () => range(0, 100000);
        const fnBase = () => {
            return [...getValues()]
                .filter(a => !!(a & 1))
                .slice(1000)
                .slice(0,10000)
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        };

        const fnExp = () => {
            return GS.genSequence(getValues())
                .filter(a => !!(a & 1))
                .skip(1000)
                .take(10000)
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        }
        const rBase = measure(fnBase, 10);
        const rExp = measure(fnExp, 10);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.equal(rBase.result);
        console.log('filter slice filter reduce' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(1);
    });

    it('filter slice filter reduce (1000)', () => {
        const getValues = () => range(0, 1000);
        const fnBase = () => {
            return [...getValues()]
                .filter(a => !!(a & 1))
                .slice(100)
                .slice(0,500)
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        };

        const fnExp = () => {
            return GS.genSequence(getValues())
                .filter(a => !!(a & 1))
                .skip(100)
                .take(500)
                .filter(a => !!(a & 2))
                .reduce((a, b) => a + b);
        }
        const rBase = measure(fnBase, 1000);
        const rExp = measure(fnExp, 1000);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.equal(rBase.result);
        console.log('filter slice filter reduce (1000)' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(2);
    });

    it('filter slice filter first (1000)', () => {
        const getValues = () => range(0, 1000);
        const fnBase = () => {
            return [...getValues()]
                .filter(a => !!(a & 1))
                .slice(100)
                .slice(0,500)
                .filter(a => !!(a & 2))
                .filter(a => !!(a & 200))
                .shift();
        };

        const fnExp = () => {
            return GS.genSequence(getValues())
                .filter(a => !!(a & 1))
                .skip(100)
                .take(500)
                .filter(a => !!(a & 2))
                .filter(a => !!(a & 200))
                .first();
        }
        const rBase = measure(fnBase, 1000);
        const rExp = measure(fnExp, 1000);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.equal(rBase.result);
        console.log('filter slice filter first (1000)' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(3);
    });

    it('concatMap', () => {
        const getValues = () => range(0, 100);
        const getNested = () => range(0, 1000);
        const fnBase = () => {
            return [...getValues()]
                .map(() => [...getNested()])
                .reduce((a, b) => a.concat(b))
                .filter(a => !!(a & 1))
                .map(a => a + 10)
                .filter(a => a < 500)
                .slice(100)
                .slice(0, 10000)
                .reduce((a, b) => a + b);
        };

        const fnExp = () => {
            return GS.genSequence(getValues())
                .concatMap(() => getNested())
                .filter(a => !!(a & 1))
                .map(a => a + 10)
                .filter(a => a < 500)
                .skip(100)
                .take(10000)
                .reduce((a, b) => a + b);
        }
        const rBase = measure(fnBase, 100);
        const rExp = measure(fnExp, 100);
        const ratio = rExp.avg / rBase.avg;

        expect(rExp.result).to.equal(rBase.result);
        console.log('concatMap' + compareMeasurementsToString(rBase, rExp));
        expect(ratio).to.be.lessThan(2);
    });
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
        count
    }
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

function compareMeasurementsToString<T>(base: Measurement<T>, comp: Measurement<T>): string {
    function fix(n: number | undefined) {
        if (n === undefined) {
            return '-';
        }
        return n.toFixed(3);
    }
    return `
\tbase\tcomp
avg:\t${fix(base.avg)}\t${fix(comp.avg)}
min:\t${fix(base.min)}\t${fix(comp.min)}
max:\t${fix(base.max)}\t${fix(comp.max)}
cnt:\t${base.count}\t${comp.count}
ratio:\t${fix((comp.avg || 0) / (base.avg || 1))}
`;
}