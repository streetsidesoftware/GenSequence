
export type Maybe<T> = T | undefined;

export interface IterableLike<T> {
    [Symbol.iterator](): Iterator<T> | IterableIterator<T>;
}

export interface Sequence<T> extends IterableLike<T> {
    next(): IteratorResult<T>;

    //// Filters
    /** keep values where the fnFilter(t) returns true */
    filter(fnFilter: (t: T) => boolean): Sequence<T>;
    skip(n: number): Sequence<T>;
    take(n: number): Sequence<T>;

    //// Extenders
    concat(j: Iterable<T>): Sequence<T>;
    concatMap<U>(fn: (t: T) => Iterable<U>): Sequence<U>;

    //// Mappers
    /** map values from type T to type U */
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): Sequence<V>;
    map<U>(fnMap: (t: T) => U): Sequence<U>;
    scan(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue?: T): Sequence<T>;
    scan<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): Sequence<U>;

    //// Reducers
    all(fnFilter: (t: T) => boolean): boolean;
    any(fnFilter: (t: T) => boolean): boolean;
    count(): number;
    first(fnFilter?: (t: T) => boolean, defaultValue?: T): Maybe<T>;
    first(fnFilter: (t: T) => boolean, defaultValue: T): T;
    forEach(fn: (t: T, index: number) => void): void;
    max(fnSelector?: (t: T) => T): Maybe<T>;
    max<U>(fnSelector: (t: T) => U): Maybe<T>;
    min(fnSelector?: (t: T) => T): Maybe<T>;
    min<U>(fnSelector: (t: T) => U): Maybe<T>;
    /** reduce function see Array.reduce */
    reduce(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T): Maybe<T>;
    reduce<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
    reduceToSequence<U, V extends GenIterable<U>>(fnReduce: (previousValue: V, currentValue: T, currentIndex: number) => V, initialValue: V): Sequence<U>;
    reduceToSequence<U>(fnReduce: (previousValue: GenIterable<U>, currentValue: T, currentIndex: number) => GenIterable<U>, initialValue: GenIterable<U>): Sequence<U>;

    //// Cast
    toArray(): T[];
    toIterable(): IterableIterator<T>;
}

export interface GenIterable<T> extends IterableLike<T> {}

export interface SequenceCreator<T> {
    (i: GenIterable<T>): Sequence<T>;
    fromObject: <U>(u: U) => Sequence<KeyValuePair<U>>;
}

export function genSequence<T>(i: () => GenIterable<T>): Sequence<T>;
export function genSequence<T>(i: GenIterable<T>): Sequence<T>;
export function genSequence<T>(i: (() => GenIterable<T>) | GenIterable<T>): Sequence<T> {
    let createIterable: () => GenIterable<T>;
    if (typeof i === "function") {
        createIterable = i;
    } else {
        // this is typeof "object"
        createIterable = () => i;
    }

    function fnNext() {
        let iter: Maybe<Iterator<T>>;
        return () => {
            if(!iter) {
                iter = createIterable()[Symbol.iterator]();
            }
            const result: IteratorResult<T> = iter.next();
            if (result.done) {
                iter = undefined;
            }

            return result;
        };
    }

    const seq = {
        [Symbol.iterator]: () => createIterable()[Symbol.iterator](),
        next: fnNext(),   // late binding is intentional here.

        //// Filters
        filter: (fnFilter: (t: T) => boolean) => genSequence(() => filter(fnFilter, createIterable())),
        skip: (n: number) => {
            return genSequence(() => skip(n, createIterable()));
        },
        take: (n: number) => {
            return genSequence(() => take(n, createIterable()));
        },

        //// Extenders
        concat: (j: Iterable<T>) => {
            return genSequence(() => concat(createIterable(), j));
        },
        concatMap: <U>(fn: (t: T) => Iterable<U>) => {
            return genSequence(() => concatMap(fn, createIterable()));
        },

        //// Mappers
        combine: <U, V>(fn: (t: T, u: U) => V, j: Iterable<U>) =>  {
            return genSequence(() => combine(fn, createIterable(), j));
        },
        map: <U>(fn: (t: T) => U) => genSequence(() => map(fn, createIterable())),
        scan: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) => {
            return genSequence(() => scan(createIterable(), fnReduce, initValue));
        },

        // Reducers
        all: (fnFilter: (t: T) => boolean): boolean => {
            return all(fnFilter, createIterable());
        },
        any: (fnFilter: (t: T) => boolean): boolean => {
            return any(fnFilter, createIterable());
        },
        count: (): number => {
            return count(createIterable());
        },
        first: (fnFilter: (t: T) => boolean, defaultValue: T): T => {
            return first(fnFilter, defaultValue, createIterable()) as T;
        },
        forEach: (fn: (t: T, index: number) => void): void => {
            return forEach(fn, createIterable());
        },
        max: <U>(fnSelector: (t: T) => U): Maybe<T> =>  {
            return max<T, U>(fnSelector, createIterable());
        },
        min: <U>(fnSelector: (t: T) => U): Maybe<T> =>  {
            return min<T, U>(fnSelector, createIterable());
        },
        reduce: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) => {
            return reduce<T, U>(fnReduce, initValue!, createIterable());
        },
        reduceToSequence: <U>(
            fnReduce: (previousValue: GenIterable<U>, currentValue: T, currentIndex: number) => GenIterable<U>,
            initialValue: GenIterable<U>
        ): Sequence<U> => {
            return genSequence<U>(reduce<T, GenIterable<U>>(fnReduce, initialValue!, createIterable()));
        },

        //// Cast
        toArray: () => [...createIterable()],
        toIterable: () => {
            return toIterator(createIterable());
        },
    };

    return seq;
}

// Collection of entry points into GenSequence
export const GenSequence = {
    genSequence,
    sequenceFromRegExpMatch,
    sequenceFromObject,
};

//// Filters
export function* filter<T>(fnFilter: (t: T) => boolean, i: Iterable<T>) {
    for (const v of i) {
        if (fnFilter(v)) {
            yield v;
        }
    }
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

//// Extenders
/**
 * Concat two iterables together
 */
export function* concat<T>(i: Iterable<T>, j: Iterable<T>): IterableIterator<T> {
    yield *i;
    yield *j;
}

export function* concatMap<T, U>(fn: (t: T) => Iterable<U>, i: Iterable<T>): IterableIterator<U> {
    for (const t of i) {
        for (const u of fn(t)) {
            yield u;
        }
    }
}

//// Mappers
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

export function scan<T, U>(i: Iterable<T>, fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): IterableIterator<U>;
export function* scan<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue?: T): IterableIterator<T> {
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
    let prevValue = initValue;
    for (const t of i) {
        const nextValue = fnReduce(prevValue, t, index);
        yield nextValue;
        prevValue = nextValue;
        index += 1;
    }
}

//// Reducers
export function all<T>(fn: (t: T) => boolean, i: Iterable<T>): boolean {
    for (const t of i) {
        if (!fn(t)) {
            return false;
        }
    }
    return true;
}

export function any<T>(fn: (t: T) => boolean, i: Iterable<T>): boolean {
    for (const t of i) {
        if (fn(t)) {
            return true;
        }
    }
    return false;
}

export function count<T>(i: Iterable<T>): number {
    return reduce<T, number>(p => p + 1, 0, i);
}

export function first<T>(fn: Maybe<(t: T) => boolean>, defaultValue: Maybe<T>, i: Iterable<T>): Maybe<T>;
export function first<T>(fn: (t: T) => boolean, defaultValue: T, i: Iterable<T>): T {
    fn = fn || (() => true);
    for (const t of i) {
        if (fn(t)) {
            return t;
        }
    }
    return defaultValue;
}

export function forEach<T>(fn: (t: T, index: number) => void, i: Iterable<T>) {
    let index = 0;
    for (const t of i) {
        fn(t, index);
        index += 1;
    }
}

export function max<T, U>(selector: (t: T) => U, i: Iterable<T>): Maybe<T>;
export function max<T>(selector: (t: T) => T = (t => t), i: Iterable<T>): Maybe<T> {
    return reduce((p: T, c: T) => selector(c) > selector(p) ? c : p, undefined, i);
}

export function min<T, U>(selector: (t: T) => U, i: Iterable<T>): Maybe<T>;
export function min<T>(selector: (t: T) => T = (t => t), i: Iterable<T>): Maybe<T> {
    return reduce((p: T, c: T) => selector(c) < selector(p) ? c : p, undefined, i);
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

//// Cast
export function* toIterator<T>(i: Iterable<T>) {
    yield* i;
}

//// Utilities
/**
 * Convert an Iterator into an IterableIterator
 */
export function makeIterable<T>(i: Iterator<T>) {
    function* iterate() {
        for (let r = i.next(); ! r.done; r = i.next()) {
            yield r.value;
        }
    }
    return iterate();
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
    return sequenceFromObject<T>(t);
}


export function sequenceFromObject<T>(t: T): Sequence<KeyValuePair<T>> {
    return genSequence(() => objectIterator(t));
}

export function sequenceFromRegExpMatch(pattern: RegExp, text: string): Sequence<RegExpExecArray> {
    function* doMatch() {
        const regex = new RegExp(pattern);
        let match: RegExpExecArray | null;
        let lastIndex: number | undefined = undefined;
        while ( match = regex.exec(text) ) {
            // Make sure it stops if the index does not move forward.
            if (match.index === lastIndex) {
                break;
            }
            lastIndex = match.index;
            yield match;
        }
    }

    return genSequence(() => doMatch());
}

export default genSequence;
