import * as test from 'tape';
import * as GS from './GenSequence';
import {from} from './Seq';
import {filter, reduce, skip, take, first, concatMap, map} from './operators';

test('Simple Generator to an array', (t) => {
    const fnBase = () => {
        return [...range(0, 10000)]
    };

    const fnSeq = () => {
        return from(range(0, 10000)).toArray();
    }
    const rBase = measure('base', fnBase, 100);
    const rSeq = measure('seq', fnSeq, 100);

    t.deepEquals(rSeq.result, rBase.result);
    console.log('Simple Generator to an array' + compareMeasurementsToString(rBase, rSeq));
    t.end();
});

test('filter filter reduce', (t) => {
    const testName = 'filter filter reduce';
    const getValues = () => range(0, 100000);
    const fnBase = () => {
        return [...getValues()]
            .filter(a => !!(a & 1))
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    };

    const fnSeq = () => {
        return from(getValues()).pipe(
            filter(a => !!(a & 1)),
            filter(a => !!(a & 2)),
            reduce((a, b) => a + b),
        ).toValue();
    }
    const fnExp = () => {
        return GS.genSequence(getValues())
            .filter(a => !!(a & 1))
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    }
    const measurements = [
        measure('base', fnBase, 10),
        measure('seq', fnSeq, 10),
        measure('gen', fnExp, 10),
    ];

    measurements.forEach(m => t.equals(m.result, measurements[0].result));
    console.log(testName + compareMeasurementsToString(...measurements));
    t.end();
});

test('filter slice filter reduce', (t) => {
    const testName = 'filter slice filter reduce';
    const getValues = () => range(0, 100000);
    const fnBase = () => {
        return [...getValues()]
            .filter(a => !!(a & 1))
            .slice(1000)
            .slice(0,10000)
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    };

    const fnSeq = () => {
        return from(getValues()).pipe(
            filter(a => !!(a & 1)),
            skip(1000),
            take(10000),
            filter(a => !!(a & 2)),
            reduce((a, b) => a + b),
        ).toValue();
    }
    const fnExp = () => {
        return GS.genSequence(getValues())
            .filter(a => !!(a & 1))
            .skip(1000)
            .take(10000)
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    }
    const measurements = [
        measure('base', fnBase, 10),
        measure('seq', fnSeq, 10),
        measure('gen', fnExp, 10),
    ];

    measurements.forEach(m => t.equals(m.result, measurements[0].result));
    console.log(testName + compareMeasurementsToString(...measurements));
    t.end();
});

test('filter slice filter reduce (1000)', (t) => {
    const testName = 'filter slice filter reduce (1000)';
    const getValues = () => range(0, 2000);
    const fnBase = () => {
        return [...getValues()]
            .filter(a => !!(a & 1))
            .slice(100)
            .slice(0,500)
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    };

    const fnSeq = () => {
        return from(getValues()).pipe(
            filter(a => !!(a & 1)),
            skip(100),
            take(500),
            filter(a => !!(a & 2)),
            reduce((a, b) => a + b),
        ).toValue();
    }
    const fnExp = () => {
        return GS.genSequence(getValues())
            .filter(a => !!(a & 1))
            .skip(100)
            .take(500)
            .filter(a => !!(a & 2))
            .reduce((a, b) => a + b);
    }
    const measurements = [
        measure('base', fnBase, 1000),
        measure('seq', fnSeq, 1000),
        measure('gen', fnExp, 1000),
    ];

    measurements.forEach(m => t.equals(m.result, measurements[0].result));
    console.log(testName + compareMeasurementsToString(...measurements));
    t.end();
});

test('filter slice filter first (1000)', (t) => {
    const testName = 'filter slice filter first (1000)';
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

    const fnSeq = () => {
        return from(getValues()).pipe(
            filter(a => !!(a & 1)),
            skip(100),
            take(500),
            filter(a => !!(a & 2)),
            filter(a => !!(a & 200)),
            first(),
        ).toValue();
    }
    const fnExp = () => {
        return GS.genSequence(getValues())
            .filter(a => !!(a & 1))
            .skip(100)
            .take(500)
            .filter(a => !!(a & 2))
            .filter(a => !!(a & 200))
            .first();
    }
    const measurements = [
        measure('base', fnBase, 1000),
        measure('seq', fnSeq, 1000),
        measure('gen', fnExp, 1000),
    ];

    measurements.forEach(m => t.equals(m.result, measurements[0].result));
    console.log(testName + compareMeasurementsToString(...measurements));
    t.end();
});

test('concatMap', (t) => {
    const testName = 'concatMap';
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

    const fnSeq = () => {
        return from(getValues()).pipe(
            concatMap(() => getNested()),
            filter(a => !!(a & 1)),
            map(a => a + 10),
            filter(a => a < 500),
            skip(100),
            take(10000),
            reduce((a, b) => a + b),
        ).toValue();
    }
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
    const measurements = [
        measure('base', fnBase, 100),
        measure('seq', fnSeq, 100),
        measure('gen', fnExp, 100),
    ];

    measurements.forEach(m => t.equals(m.result, measurements[0].result));
    console.log(testName + compareMeasurementsToString(...measurements));
    t.end();
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
    name: string;
    result: T | undefined;
    avg: number;
    min: number | undefined;
    max: number | undefined;
    count: number;
}

function measure<T>(name: string, fn: () => T, count = 1): Measurement<T> {
    let sum = 0;
    count = Math.max(count, 1);
    const measurement: Measurement<T> = {
        name,
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

function compareMeasurementsToString<T>(...ms: Measurement<T>[]): string {
    function fix(n: number | undefined) {
        if (n === undefined) {
            return '-';
        }
        return n.toFixed(3);
    }
    function ratio(): string {
        const base = ms[0].avg || 1;
        return ms.map(v => fix((v.avg || 0) / base)).join('\t');
    }
    return `
name:\t${ms.map(a => a.name).join('\t')}
avg:\t${ms.map(a => fix(a.avg)).join('\t')}
min:\t${ms.map(a => fix(a.min)).join('\t')}
max:\t${ms.map(a => fix(a.max)).join('\t')}
cnt:\t${ms.map(a => a.count).join('\t')}
ratio:\t${ratio()}
`;
}