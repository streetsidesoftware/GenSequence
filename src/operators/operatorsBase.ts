import { Maybe, IterableLike, AsyncIterableLike, IterableOfPromise } from '../types';

/**
 * Operators used by Sequence
 */

//// Filters
export function* filter<T>(fnFilter: (t: T) => boolean, i: IterableLike<T>): IterableIterator<T> {
    for (const v of i) {
        if (fnFilter(v)) {
            yield v;
        }
    }
}

export function* skip<T>(n: number, i: IterableLike<T>): IterableIterator<T> {
    let a = 0;
    for (const t of i) {
        if (a >= n) {
            yield t;
        }
        a += 1;
    }
}


export function* take<T>(n: number, i: IterableLike<T>): IterableIterator<T> {
    let a = 0;
    if (n) {
        for (const t of i) {
            if (a >= n) {
                break;
            }
            yield t;
            a += 1;
        }
    }
}

//// Extenders
/**
 * Concat two iterables together
 */
export function* concat<T>(i: IterableLike<T>, j: IterableLike<T>): IterableIterator<T> {
    yield *i;
    yield *j;
}

export function* concatMap<T, U>(fn: (t: T) => IterableLike<U>, i: IterableLike<T>): IterableIterator<U> {
    for (const t of i) {
        yield *fn(t);
    }
}

//// Mappers
/**
 * Combine two iterables together using fnMap function.
 */
export function* combine<T, U, V>(
    fnMap: (t: T, u?: U) => V,
    i: IterableLike<T>,
    j: IterableLike<U>
): IterableIterator<V> {
    const jit = j[Symbol.iterator]();
    for (const r of i) {
        const s = jit.next().value;
        yield fnMap(r, s);
    }
}

/**
 * apply a mapping function to an Iterable.
 */
export function map<T, U>(fnMap: (t: T) => U): (i: IterableLike<T>) => IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i: IterableLike<T>): IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i?: IterableLike<T>): IterableIterator<U> | ((i: IterableLike<T>) => IterableIterator<U>) {
    function* fn<T, U>(fnMap: (t: T) => U, i: IterableLike<T>): IterableIterator<U> {
        for (const v of i) {
            yield fnMap(v);
        }
    }

    if (i !== undefined) {
        return fn(fnMap, i);
    }

    return function(i: IterableLike<T>) {
        return fn(fnMap, i);
    };
}

export function scan<T>(i: IterableLike<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T): IterableIterator<T>;
export function scan<T>(i: IterableLike<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue: T): IterableIterator<T>;
export function scan<T, U>(i: IterableLike<T>, fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): IterableIterator<U>;
export function* scan<T>(i: IterableLike<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue?: T): IterableIterator<T> {
    let index = 0;
    if (initValue === undefined) {
        // We need to create a new iterable to prevent for...of from restarting an array.
        index = 1;
        const iter = i[Symbol.iterator]();
        let r = iter.next();
        if (!r.done) yield r.value;
        initValue = r.value;
        i = makeIterable(iter);
    }
    let prevValue: T = initValue!;
    for (const t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        yield nextValue;
        prevValue = nextValue;
        index += 1;
    }
}

//// Reducers
export function all<T>(fn: (t: T) => boolean, i: IterableLike<T>): boolean {
    for (const t of i) {
        if (!fn(t)) {
            return false;
        }
    }
    return true;
}

export function any<T>(fn: (t: T) => boolean, i: IterableLike<T>): boolean {
    for (const t of i) {
        if (fn(t)) {
            return true;
        }
    }
    return false;
}

export function count<T>(i: IterableLike<T>): number {
    return reduce<T, number>(p => p + 1, 0, i);
}

export function first<T>(fn: Maybe<(t: T) => boolean>, defaultValue: Maybe<T>, i: IterableLike<T>): Maybe<T>;
export function first<T>(fn: (t: T) => boolean, defaultValue: T, i: IterableLike<T>): T;
export function first<T>(fn: Maybe<(t: T) => boolean>, defaultValue: Maybe<T>, i: IterableLike<T>): Maybe<T> {
    fn = fn || (() => true);
    for (const t of i) {
        if (fn(t)) {
            return t;
        }
    }
    return defaultValue;
}

export function forEach<T>(fn: (t: T, index: number) => void, i: IterableLike<T>) {
    let index = 0;
    for (const t of i) {
        fn(t, index);
        index += 1;
    }
}

export function max<T, U>(selector: undefined, i: IterableLike<T>): Maybe<T>;
export function max<T, U>(selector: ((t: T) => U) | undefined, i: IterableLike<T>): Maybe<T>;
export function max<T>(selector: ((t: T) => T) | undefined = (t => t), i: IterableLike<T>): Maybe<T> {
    return reduce((p: T, c: T) => selector(c) > selector(p) ? c : p, undefined, i);
}

export function min<T>(selector: undefined, i: IterableLike<T>): Maybe<T>;
export function min<T, U>(selector: ((t: T) => U) | undefined, i: IterableLike<T>): Maybe<T>;
export function min<T>(selector: ((t: T) => T) | undefined = (t => t), i: IterableLike<T>): Maybe<T> {
    return reduce((p: T, c: T) => selector(c) < selector(p) ? c : p, undefined, i);
}

export function reduce<T, U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initialValue: U, i: IterableLike<T>): U;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: T, i: IterableLike<T>): T;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>, i: IterableLike<T>): Maybe<T>;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>, i: IterableLike<T>): Maybe<T> {
    // We need to create a new iterable to prevent for...of from restarting an array.
    const iter = makeIterable(i[Symbol.iterator]());
    let index = 0;
    if (initialValue === undefined) {
        index = 1;
        const r = iter.next();
        initialValue = r.value;
    }
    let prevValue: T = initialValue!;
    for (const t of iter) {
        const nextValue = fnReduce(prevValue, t, index);
        prevValue = nextValue;
        index += 1;
    }
    return prevValue;
}

export async function reduceAsync<T, U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U | Promise<U>, i: IterableOfPromise<T>, initialValue: U | Promise<U>): Promise<U>;
export async function reduceAsync<T>(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T | Promise<T>, i: IterableOfPromise<T>, initialValue?: T | Promise<T>): Promise<T>;
export async function reduceAsync<T>(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T | Promise<T>, i: IterableOfPromise<T>, initialValue?: T | Promise<T>): Promise<T> {
    // We need to create a new iterable to prevent for...of from restarting an array.
    const iter = makeIterable((i as Iterable<Promise<T>>)[Symbol.iterator]());
    let index = 0;
    if (initialValue === undefined) {
        index = 1;
        const r = iter.next();
        initialValue = r.value;
    }
    let previousValue = await initialValue;

    for (const p of iter) {
        const t = await p;
        const nextValue = await fnReduce(previousValue!, t, index);
        previousValue = nextValue;
        index += 1;
    }
    return previousValue!;
}

export async function reduceAsyncForAsyncIterator<T, U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U | Promise<U>, i: AsyncIterableLike<T>, initialValue?: U | Promise<U>): Promise<U>;
export async function reduceAsyncForAsyncIterator<T>(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T | Promise<T>, i: AsyncIterableLike<T>, initialValue?: T | Promise<T>): Promise<T>;
export async function reduceAsyncForAsyncIterator<T>(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T | Promise<T>, i: AsyncIterableLike<T>, initialValue?: T | Promise<T>): Promise<T> {
    const iter = makeAsyncIterable(i[Symbol.asyncIterator]());
    let index = 0;
    if (initialValue === undefined) {
        index = 1;
        const r = await iter.next();
        initialValue = r.value;
    }
    let previousValue = await initialValue;

    for await (const t of iter) {
        const nextValue = await fnReduce(previousValue!, t, index);
        previousValue = nextValue;
        index += 1;
    }
    return previousValue!;
}

//// Utilities
/**
 * Convert an Iterator into an IterableIterator
 */
export function makeIterable<T>(i: Iterator<T> | Iterable<T> | IterableIterator<T>): IterableIterator<T> {
    function* fromIterator(i: Iterator<T>) {
        for (let r = i.next(); ! r.done; r = i.next()) {
            yield r.value;
        }
    }
    function* fromIterable(i: Iterable<T>): IterableIterator<T> {
        yield *i;
    }
    return isIterable(i) ? (isIterableIterator(i) ? i : fromIterable(i)) : fromIterator(i);
}

export function isIterable<T>(i: Iterator<T> | IterableLike<T> | AsyncIterator<T> | AsyncIterableIterator<T>): i is IterableLike<T> {
    return !!(i as IterableIterator<T>)[Symbol.iterator];
}

export function isIterableIterator<T>(i: IterableLike<T>): i is IterableIterator<T> {
    return typeof (i as IterableIterator<T>).next == 'function';
}

export function makeAsyncIterable<T>(i: Iterator<T> | Iterable<T> | IterableIterator<T> | AsyncIterator<T> | AsyncIterable<T> | AsyncIterableIterator<T>): AsyncIterableIterator<T> {
    async function* fromIterable(i: IterableIterator<T> | Iterable<T>) {
        for (const v of i) {
            yield v;
        }
    }
    async function* fromIterator(i: AsyncIterator<T> | Iterator<T>) {
        for (let r = await i.next(); ! r.done; r = await i.next()) {
            yield r.value;
        }
    }

    async function* fromAsyncIterable(i: AsyncIterable<T>) {
        yield *i;
    }

    return isAsyncIterable(i) ? (isAsyncIterableIterator(i) ? i : fromAsyncIterable(i)) :
        isIterable(i) ? fromIterable(i) :
        fromIterator(i);
}

export function isAsyncIterable<T>(i: Iterator<T> | Iterable<T> | AsyncIterator<T> | AsyncIterable<T> | AsyncIterableIterator<T>): i is AsyncIterableLike<T> {
    return !!(i as AsyncIterableLike<T>)[Symbol.asyncIterator];
}

export function isAsyncIterableIterator<T>(i: AsyncIterableLike<T>): i is AsyncIterableIterator<T> {
    return typeof (i as AsyncIterableIterator<T>).next == 'function';
}

/**
 * Creates a scan function that can be used in a map function.
 */
export function scanMap<T>(accFn: (acc: T, value: T) => T, init?: T): ((value: T) => T);
export function scanMap<T, U>(accFn: (acc: U, value: T) => U, init: U): ((value: T) => U);
export function scanMap<T>(accFn: (acc: T, value: T) => T, init?: T): ((value: T) => T) {
    let acc = init;
    let first = true;
    return function(value: T): T {
        if (first && acc === undefined) {
            first = false;
            acc = value;
            return acc;
        }
        acc = accFn(acc as T, value);
        return acc;
    };
}
