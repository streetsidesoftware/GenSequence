import {OperatorFunction} from './types';
import * as oper from './operators';

export interface Seq<T> extends IterableIterator<T> {
    pipe(): Seq<T>;
    pipe<U>(op: OperatorFunction<T, U>): Seq<U>;
    pipe<U, V>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>): Seq<V>;
    pipe<U, V, W>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>): Seq<W>;
    pipe<U, V, W, X>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>): Seq<X>;
    pipe<U, V, W, X, Y>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>, op4: OperatorFunction<X, Y>): Seq<Y>;
    pipe<U, V, W, X, Y, Z>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>, op4: OperatorFunction<X, Y>, op5: OperatorFunction<Y, Z>): Seq<Z>;
    pipe<U, V, W, X, Y, Z, A>(op: OperatorFunction<T, U>, op1: OperatorFunction<U, V>, op2: OperatorFunction<V, W>, op3: OperatorFunction<W, X>, op4: OperatorFunction<X, Y>, op5: OperatorFunction<Y, Z>, op6: OperatorFunction<Z, A>): Seq<A>;

    toArray(): T[];
    toValue(): T | undefined;
}

export class SeqImpl<T> implements Seq<T>, IterableIterator<T> {
    constructor(public iter: IterableIterator<T>) {}

    [Symbol.iterator]() {
        return this.iter;
    }

    next(value?: any): IteratorResult<T> {
        return this.iter.next(value);
    }

    pipe(...ops: OperatorFunction<T,T>[]): Seq<T> {
        return from(oper.pipe(...ops)(this.iter));
    }

    toArray() {
        return [...this.iter];
    }

    toValue() {
        return this.iter.next().value;
    }
}

export function from<T>(iter: IterableIterator<T>): Seq<T> {
    return new SeqImpl(iter);
}
