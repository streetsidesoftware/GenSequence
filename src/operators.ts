import { OperatorFunction, IterableLike } from './types';
import * as iop from './internal/operators';

export function pipe<T>(...fns: OperatorFunction<T, T>[]): OperatorFunction<T, T>;
export function pipe<T>(): OperatorFunction<T, T>;
export function pipe<T, U>(op: OperatorFunction<T, U>): OperatorFunction<T, U>;
export function pipe<T, U, V>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>): OperatorFunction<T, V>;
export function pipe<T, U, V, W>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>): OperatorFunction<T, W>;
export function pipe<T, U, V, W, X>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>): OperatorFunction<T, X>;
export function pipe<T, U, V, W, X, Y>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>, op4: OperatorFunction<X, Y>): OperatorFunction<T, Y>;
export function pipe<T, U, V, W, X, Y, Z>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>, op4: OperatorFunction<X, Y>, op5: OperatorFunction<Y, Z>): OperatorFunction<T, Z>;
export function pipe<T>(...fns: OperatorFunction<T, T>[]): OperatorFunction<T, T> {
    return (iter: IterableIterator<T>) => {
        return fns.reduce((prev, fn) => fn(prev), iter);
    };
}


/**
 *
 * Mapping Operators
 *
 */

export function map<T, U>(fn: (v: T) => U): OperatorFunction<T, U> {
    return (iter: IterableLike<T>) => iop.map(iter, fn);
}

export function concatMap<T, U>(fn: (v: T) => IterableLike<U>): OperatorFunction<T, U> {
    return (iter: IterableLike<T>) => iop.concatMap(iter, fn);
}

export function tap<T>(fn: (v: T) => void): OperatorFunction<T, T> {
    return function *(iter: IterableLike<T>) {
        for (const t of iter) {
            fn(t);
            yield t;
        }
    }
}

/**
 *
 * Filter Operators
 *
 */

export function filter<T>(predicate: (v: T) => boolean): OperatorFunction<T, T> {
    return (iter: IterableLike<T>) => iop.filter(iter, predicate);
}

export function skip<T>(n: number): OperatorFunction<T, T> {
    return (iter: IterableLike<T>) => iop.skip(iter, n);
}

export function take<T>(n: number): OperatorFunction<T, T> {
    return (iter: IterableLike<T>) => iop.take(iter, n);
}

export function first<T>(predicate?: (v: T) => boolean): OperatorFunction<T, T> {
    return predicate ? pipe(filter(predicate), take(1)) : take(1);
}

/**
 * Reduce
 */

export function reduce<T>(fnReduce: (prev: T, curr: T, curIndex: number) => T): OperatorFunction<T, T>;
export function reduce<T, U>(fnReduce: (prev: U, curr: T, curIndex: number) => U, initialValue: U): OperatorFunction<T, U>;
export function reduce<T>(fnReduce: (prev: T, curr: T, curIndex: number) => T, initialValue?: T): OperatorFunction<T, T> {
    return function *(iter: IterableLike<T>) {
        const i = iter[Symbol.iterator]();
        let index = 0;
        if (initialValue === undefined) {
            const r = i.next();
            if (r.done) return;
            initialValue = r.value;
            index += 1;
        }

        let prevValue = initialValue;
        for (const t of iter) {
            const nextValue = fnReduce(prevValue, t, index);
            prevValue = nextValue;
            index += 1;
        }
        yield prevValue;
    }
}
