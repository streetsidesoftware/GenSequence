export type Maybe<T> = T | undefined;

export interface IterableLike<T> {
    [Symbol.iterator](): Iterator<T> | IterableIterator<T>;
}

export interface GenIterable<T> extends IterableLike<T> {}

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
