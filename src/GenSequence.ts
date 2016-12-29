
export type Maybe<T> = T | undefined;

export interface Sequence<T> extends IterableIterator<T> {
    /** map values from type T to type U */
    map<U>(fnMap: (t: T) => U): Sequence<U>;
    /** keep values where the fnFilter(t) returns true */
    filter(fnFilter: (t: T) => boolean): Sequence<T>;
    /** reduce function see Array.reduce */
    reduce(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T): Maybe<T>;
    reduce<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
    reduceToSequence<U>(fnReduce: (previousValue: GenIterable<U>, currentValue: T, currentIndex: number) => GenIterable<U>, initialValue: GenIterable<U>): Sequence<U>;
    scan(fnReduce: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): Sequence<T>;
    scan<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): Sequence<U>;
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): Sequence<V>;
    concat(j: Iterable<T>): Sequence<T>;
    concatMap<U>(fn: (t: T) => Iterable<U>): Sequence<U>;
    skip(n: number): Sequence<T>;
    take(n: number): Sequence<T>;
    first(fnFilter?: (t: T)=> boolean): Maybe<T>;
    toArray(): T[];
    toIterable(): IterableIterator<T>;
}

export interface GenIterable<T> {
    [Symbol.iterator](): IterableIterator<T>;
}

export interface SequenceCreator<T> {
    (i: GenIterable<T>): Sequence<T>;
    fromObject: <U>(u: U) => Sequence<KeyValuePair<U>>;
}

export function genSequence<T>(i: GenIterable<T>): Sequence<T> {
    return {
        [Symbol.iterator]: () => i[Symbol.iterator](),
        next: () => i[Symbol.iterator]().next(),   // late binding is intentional here.
        map: <U>(fn: (t: T) => U) => genSequence(map(fn, i)),
        filter: (fnFilter: (t: T) => boolean) => genSequence(filter(fnFilter, i)),
        reduce: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) => {
            return reduce<T, U>(fnReduce, initValue!, i);
        },
        reduceToSequence: <U>(fnReduce: (previousValue: GenIterable<U>, currentValue: T, currentIndex: number) => GenIterable<U>, initialValue: GenIterable<U>): Sequence<U> => {
            return genSequence<U>(reduce<T, GenIterable<U>>(fnReduce, initialValue!, i));
        },
        scan: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) => {
            return genSequence(scan(i, fnReduce, initValue));
        },
        combine: <U, V>(fn: (t: T, u: U) => V, j: Iterable<U>) =>  {
            return genSequence(combine(fn, i, j));
        },
        concat: (j: Iterable<T>) => {
            return genSequence(concat(i, j));
        },
        concatMap: <U>(fn: (t: T) => Iterable<U>) => {
            return genSequence(concatMap(fn, i));
        },
        skip: (n: number) => {
            return genSequence(skip(n, i));
        },
        take: (n: number) => {
            return genSequence(take(n, i));
        },
        first: (fnFilter?: (t: T) => boolean) => {
            return first(fnFilter, i);
        },
        toArray: () => [...i[Symbol.iterator]()],
        toIterable: () => {
            return toIterator(i);
        },
    };
}

// Naming Compatibility
export const GenSequence = genSequence;

export function* filter<T>(fnFilter: (t: T) => boolean, i: Iterable<T>) {
    for (const v of i) {
        if (fnFilter(v)) {
            yield v;
        }
    }
}

export function reduce<T, U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initialValue: U, i: Iterable<T>): U;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>, i: Iterable<T>): Maybe<T> {
    let index = 0;
    if (initialValue === undefined) {
        index = 1;
        const r = i[Symbol.iterator]().next();
        initialValue = r.value;
    }
    let prevValue = initialValue;
    for (const t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        prevValue = nextValue;
        index += 1;
    }
    return prevValue;
}

export function scan<T, U>(i: Iterable<T>, fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): IterableIterator<U>;
export function* scan<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue?: T): IterableIterator<T> {
    let index = 0;
    if (initValue === undefined) {
        index = 1;
        const r = i[Symbol.iterator]().next();
        initValue = r.value;
        if (! r.done) {
            yield r.value;
        }
    }
    let prevValue = initValue;
    for (const t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        yield nextValue;
        prevValue = nextValue;
        index += 1;
    }
}

/**
 * apply a mapping function to an Iterable.
 */
export function map<T, U>(fnMap: (t: T) => U): (i: Iterable<T>) => IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i: Iterable<T>): IterableIterator<U>;
export function map<T, U>(fnMap: (t: T) => U, i?: Iterable<T>): IterableIterator<U> | ((i: Iterable<T>) => IterableIterator<U>) {
    function* fn<T, U>(fnMap: (t: T) => U, i: Iterable<T>): IterableIterator<U> {
        for (const v of i) {
            yield fnMap(v);
        }
    }

    if (i !== undefined) {
        return fn(fnMap, i);
    }

    return function(i: Iterable<T>) {
        return fn(fnMap, i);
    };
}

/**
 * Combine two iterables together using fnMap function.
 */
export function* combine<T, U, V>(fnMap: (t: T, u?: U) => V, i: Iterable<T>, j: Iterable<U>): IterableIterator<V> {
    const jit = j[Symbol.iterator]();
    for (const r of i) {
        const s = jit.next().value;
        yield fnMap(r, s);
    }
}

/**
 * Concat two iterables together
 */
export function* concat<T>(i: Iterable<T>, j: Iterable<T>): IterableIterator<T> {
    yield *i;
    yield *j;
}

/**
 * Creates a scan function that can be used in a map function.
 */
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


export function* skip<T>(n: number, i: Iterable<T>): IterableIterator<T> {
    let a = 0;
    for (const t of i) {
        if (a >= n) {
            yield t;
        }
        a += 1;
    }
}


export function* take<T>(n: number, i: Iterable<T>): IterableIterator<T> {
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


export function* concatMap<T, U>(fn: (t: T) => Iterable<U>, i: Iterable<T>): IterableIterator<U> {
    for (const t of i) {
        for (const u of fn(t)) {
            yield u;
        }
    }
}

export function first<T>(fn: Maybe<(t: T) => boolean>, i: Iterable<T>): Maybe<T> {
    fn = fn || (t => true);
    for (const t of i) {
        if (fn(t)) {
            return t;
        }
    }
    return undefined;
}

export function* toIterator<T>(i: Iterable<T>) {
    yield* i;
}


export type KeyValuePair<T> = [keyof T, T[keyof T]];

export function* objectIterator<T>(t: T): IterableIterator<KeyValuePair<T>> {
    const keys = new Set(Object.keys(t));
    for (const k in t) {
        if (keys.has(k)) {
            yield [k, t[k]] as KeyValuePair<T>;
        }
    }
}

export function objectToSequence<T>(t: T): Sequence<KeyValuePair<T>> {
    return genSequence(objectIterator(t));
}

export default genSequence;
