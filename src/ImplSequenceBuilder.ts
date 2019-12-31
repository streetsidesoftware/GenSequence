import { SequenceBuilder, ChainFunction, LazyIterable, Sequence } from './types';
import { pipe, filter, skip, take, concat, concatMap, combine, map, scan } from './operators';
import { ImplSequence } from './ImplSequence';

export class ImplSequenceBuilder<S, T = S> implements SequenceBuilder<S, T> {
    private operators: ChainFunction<S, T>[] = [];

    constructor(operators: ChainFunction<S, T>[] = []) {
        this.operators = operators;
    }

    build(i: LazyIterable<S>): Sequence<T> {
        return new ImplSequence(i).pipe(pipe.apply<unknown, any, ChainFunction<S, T>>(null, this.operators));
    }

    pipe<U>(fn: ChainFunction<T, U>): SequenceBuilder<S, U> {
        return new ImplSequenceBuilder<S, U>([...this.operators, fn] as any[]);
    }

    //// Filters
    /** keep values where the fnFilter(t) returns true */
    filter(fnFilter: (t: T) => boolean): SequenceBuilder<S, T> {
        return this.pipe(filter(fnFilter));
    }

    skip(n: number): SequenceBuilder<S, T> {
        return this.pipe(skip(n));
    }

    take(n: number): SequenceBuilder<S, T> {
        return this.pipe(take(n));
    }

    //// Extenders
    concat(j: Iterable<T>): SequenceBuilder<S, T> {
        return this.pipe(concat(j));
    }

    concatMap<U>(fn: (t: T) => Iterable<U>): SequenceBuilder<S, U> {
        return this.pipe(concatMap(fn));
    }

    //// Mappers
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): SequenceBuilder<S, V> {
        return this.pipe(combine(fn, j));
    }

    /** map values from type T to type U */
    map<U>(fnMap: (t: T) => U): SequenceBuilder<S, U> {
        return this.pipe(map(fnMap));
    }

    scan(fnReduce: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue?: T): SequenceBuilder<S, T>;
    scan<U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): SequenceBuilder<S, U> {
        return this.pipe(scan(fnReduce, initialValue));
    }
}
