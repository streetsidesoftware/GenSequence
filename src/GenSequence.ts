import { IterableLike, Maybe } from './operators/types';
import { filter, skip, take, concat, concatMap, combine, map, scan, all, any, count, first, forEach, max, min, reduce } from './operators/operators';

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
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): Sequence<V>;
    /** map values from type T to type U */
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
    const createIterable: () => GenIterable<T> = (typeof i === "function") ? i : () => i;

    function fnNext() {
        let iter: Maybe<Iterator<T>>;
        return () => {
            if(!iter) {
                iter = createIterable()[Symbol.iterator]();
            }
            return iter.next();
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
        combine: <U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>) =>  {
            return genSequence(() => combine(fn, createIterable(), j));
        },
        map: <U>(fn: (t: T) => U) => genSequence(() => map(fn, createIterable())),
        scan: <U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U) => {
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
            return toIterableIterator(createIterable());
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

//// Cast
export function* toIterableIterator<T>(i: Iterable<T>) {
    yield* i;
}

/**
 * alias of toIterableIterator
 */
export const toIterator = toIterableIterator;

export type KeyValuePair<T> = [keyof T, T[keyof T]];

export function* objectIterator<T>(t: T): IterableIterator<KeyValuePair<T>> {
    const keys = new Set(Object.keys(t));
    for (const k in t) {
        // istanbul ignore else
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
