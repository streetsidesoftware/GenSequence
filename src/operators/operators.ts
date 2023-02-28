import * as op from './operatorsBase.js';

import {
    AsyncIterableLike,
    ChainFunction,
    IterableLike,
    IterableOfPromise,
    Maybe,
    ReduceAsyncFunction,
    ReduceAsyncFunctionForAsyncIterator,
    ReduceFunction,
    ThenArg,
} from '../types.js';

/**
 * Operators used by Sequence
 */

//// Filters
export function filter<T>(fnFilter: (t: T) => boolean): ChainFunction<T> {
    return (i: IterableLike<T>) => op.filter(i, fnFilter);
}

export function skip<T>(n: number): ChainFunction<T> {
    return (i: IterableLike<T>) => op.skip(i, n);
}

export function take<T>(n: number): ChainFunction<T> {
    return (i: IterableLike<T>) => op.take(i, n);
}

//// Extenders
/**
 * Concat two iterables together
 */
export function concat<T>(j: IterableLike<T>): ChainFunction<T> {
    return (i: IterableLike<T>) => op.concat(i, j);
}

export function concatMap<T, U>(fn: (t: T) => IterableLike<U>): ChainFunction<T, U> {
    return (i: IterableLike<T>) => op.concatMap(i, fn);
}

//// Mappers
/**
 * Combine two iterables together using fnMap function.
 */
export function combine<T, U, V>(fnMap: (t: T, u?: U) => V, j: IterableLike<U>): ChainFunction<T, V> {
    return (i: IterableLike<T>) => op.combine(i, j, fnMap);
}

/**
 * apply a mapping function to an Iterable.
 */
export function map<T, U>(fnMap: (t: T) => U): ChainFunction<T, U> {
    return (i: IterableLike<T>) => op.map(i, fnMap);
}

export function scan<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T): ChainFunction<T>;
export function scan<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue: T): ChainFunction<T>;
export function scan<T, U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): ChainFunction<T, U>;
export function scan<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initValue?: T): ChainFunction<T> {
    return (i: IterableLike<T>) => op.scan(i, fnReduce, initValue!);
}

//// Reducers
export function all<T>(fn: (t: T) => boolean): ReduceFunction<T, boolean> {
    return (i: IterableLike<T>) => op.all(i, fn);
}

export function any<T>(fn: (t: T) => boolean): ReduceFunction<T, boolean> {
    return (i: IterableLike<T>) => op.any(i, fn);
}

export function count<T>(): ReduceFunction<T, number> {
    return (i: IterableLike<T>) => op.count(i);
}

export function first<T>(fn: (t: T) => boolean, defaultValue: T): ReduceFunction<T>;
export function first<T>(fn?: (t: T) => boolean, defaultValue?: T): ReduceFunction<T, Maybe<T>>;
export function first<T>(fn: Maybe<(t: T) => boolean>, defaultValue: Maybe<T>): ReduceFunction<T, Maybe<T>> {
    return (i: IterableLike<T>) => op.first(i, fn, defaultValue);
}

export function forEach<T>(fn: (t: T, index: number) => void): ReduceFunction<T, void> {
    return (i: IterableLike<T>) => op.forEach(i, fn);
}

export function max<T, U>(selector: (t: T) => U): ReduceFunction<T, Maybe<T>>;
export function max<T>(selector?: (t: T) => T): ReduceFunction<T, Maybe<T>> {
    return (i: IterableLike<T>) => op.max(i, selector);
}

export function min<T, U>(selector: (t: T) => U): ReduceFunction<T, Maybe<T>>;
export function min<T>(selector?: (t: T) => T): ReduceFunction<T, Maybe<T>> {
    return (i: IterableLike<T>) => op.min(i, selector);
}

export function reduce<T, U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initialValue: U): ReduceFunction<T, U>;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: T): ReduceFunction<T>;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>): ReduceFunction<T, Maybe<T>>;
export function reduce<T>(fnReduce: (prevValue: T, curValue: T, curIndex: number) => T, initialValue: Maybe<T>): ReduceFunction<T, Maybe<T>> {
    return (i: IterableLike<T>) => op.reduce(i, fnReduce, initialValue);
}

export function reduceAsync<T, U>(
    fnReduceAsync: (previousValue: ThenArg<U>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<U> | Promise<ThenArg<U>>,
    initialValue?: ThenArg<U>
): ReduceAsyncFunction<T, Promise<ThenArg<U>>>;
export function reduceAsync<T>(
    fnReduceAsync: (previousValue: ThenArg<T>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<T> | Promise<ThenArg<T>>,
    initialValue?: ThenArg<T>
): ReduceAsyncFunction<T, Promise<ThenArg<T>>>;
export function reduceAsync<T>(
    fnReduceAsync: (previousValue: ThenArg<T>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<T> | Promise<ThenArg<T>>,
    initialValue?: ThenArg<T>
): ReduceAsyncFunction<T, Promise<ThenArg<T>>> {
    return (i: IterableOfPromise<ThenArg<T>>) => op.reduceAsync(i, fnReduceAsync, initialValue);
}

export function reduceAsyncForAsyncIterator<T, U>(
    fnReduceAsync: (previousValue: ThenArg<U>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<U> | Promise<ThenArg<U>>,
    initialValue?: ThenArg<U>
): ReduceAsyncFunctionForAsyncIterator<T, Promise<ThenArg<U>>>;
export function reduceAsyncForAsyncIterator<T>(
    fnReduceAsync: (previousValue: ThenArg<T>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<T> | Promise<ThenArg<T>>,
    initialValue?: ThenArg<T>
): ReduceAsyncFunctionForAsyncIterator<T, Promise<ThenArg<T>>>;
export function reduceAsyncForAsyncIterator<T>(
    fnReduceAsync: (previousValue: ThenArg<T>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<T> | Promise<ThenArg<T>>,
    initialValue?: ThenArg<T>
): ReduceAsyncFunctionForAsyncIterator<T, Promise<ThenArg<T>>> {
    return (i: AsyncIterableLike<ThenArg<T>>) => op.reduceAsyncForAsyncIterator(i, fnReduceAsync, initialValue);
}

export type PipeFunction<T, U = T> = ChainFunction<T, U>;

export function pipe<T>(): PipeFunction<T>;
export function pipe<T, T1>(fn0: PipeFunction<T, T1>): PipeFunction<T, T1>;
export function pipe<T, T1, T2>(fn0: PipeFunction<T, T1>, fn1: PipeFunction<T1, T2>): PipeFunction<T, T2>;
export function pipe<T, T1, T2, T3>(fn0: PipeFunction<T, T1>, fn1: PipeFunction<T1, T2>, fn2: PipeFunction<T2, T3>): PipeFunction<T, T3>;
export function pipe<T, T1, T2, T3, T4>(
    fn0: PipeFunction<T, T1>,
    fn1: PipeFunction<T1, T2>,
    fn2: PipeFunction<T2, T3>,
    fn3: PipeFunction<T3, T4>
): PipeFunction<T, T4>;
export function pipe<T, T1, T2, T3, T4, T5>(
    fn0: PipeFunction<T, T1>,
    fn1: PipeFunction<T1, T2>,
    fn2: PipeFunction<T2, T3>,
    fn3: PipeFunction<T3, T4>,
    fn4: PipeFunction<T4, T5>
): PipeFunction<T, T5>;
export function pipe<T, T1, T2, T3, T4, T5, T6>(
    fn0: PipeFunction<T, T1>,
    fn1: PipeFunction<T1, T2>,
    fn2: PipeFunction<T2, T3>,
    fn3: PipeFunction<T3, T4>,
    fn4: PipeFunction<T4, T5>,
    fn5: PipeFunction<T5, T6>
): PipeFunction<T, T6>;
export function pipe<T, T1, T2, T3, T4, T5, T6>(
    fn0: PipeFunction<T, T1>,
    fn1: PipeFunction<T1, T2>,
    fn2: PipeFunction<T2, T3>,
    fn3: PipeFunction<T3, T4>,
    fn4: PipeFunction<T4, T5>,
    fn5: PipeFunction<T5, T6>,
    ...fnRest: PipeFunction<T6, T6>[]
): PipeFunction<T, T6>;
export function pipe<T>(...fns: PipeFunction<T, T>[]): PipeFunction<T, T> {
    return (i: IterableLike<T>) => {
        for (const fn of fns) {
            i = fn ? fn(i) : i;
        }
        return i;
    };
}
