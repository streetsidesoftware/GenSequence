import { IterableLike, Maybe } from "../types";

export function* filter<T>(i: IterableLike<T>, fnFilter: (t: T) => boolean) {
    for (const v of i) {
        if (fnFilter(v)) {
            yield v;
        }
    }
}

export function* skip<T>(i: IterableLike<T>, n: number): IterableIterator<T> {
    let a = 0;
    for (const t of i) {
        if (a >= n) {
            yield t;
        }
        a += 1;
    }
}

export function* take<T>(i: IterableLike<T>, n: number): IterableIterator<T> {
    let a = 0;
    if (n > 0) {
        for (const t of i) {
            if (a >= n) {
                break;
            }
            yield t;
            a += 1;
        }
    }
}

/**
 * apply a mapping function to an Iterable.
 */
export function* map<T, U>(i: IterableLike<T>, fnMap: (t: T) => U): IterableIterator<U> {
    for (const v of i) {
        yield fnMap(v);
    }
}

/**
 * Concat two iterables together
 */
export function* concat<T>(i: IterableLike<T>, j: Iterable<T>): IterableIterator<T> {
    yield *i;
    yield *j;
}

export function* concatMap<T, U>(i: IterableLike<T>, fn: (t: T) => Iterable<U>): IterableIterator<U> {
    for (const t of i) {
        for (const u of fn(t)) {
            yield u;
        }
    }
}

export function reduce<T, U>(i: Iterable<T>, fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initialValue: U): U;
export function reduce<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: T): T;
export function reduce<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>): Maybe<T>;
export function reduce<T>(i: Iterable<T>, fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>): Maybe<T> {
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

