import { Sequence, GenIterable, Maybe, LazyIterable, ChainFunction } from './types';
import { filter, skip, take, concat, concatMap, combine, map, scan, all, any, count, first, forEach, max, min, reduce, pipe } from './operators';
import { toIterableIterator } from './util/util';

export class ImplSequence<T> implements Sequence<T> {
    private _iterator: Maybe<Iterator<T>>;

    constructor(private i: LazyIterable<T>) {
    }

    private get iter() {
        return (typeof this.i === "function") ? this.i() : this.i;
    }

    private get iterator() {
        if (!this._iterator) {
            this._iterator = this.iter[Symbol.iterator]();
        }
        return this._iterator;
    }

    private inject<U>(fn: (i: GenIterable<T>) => GenIterable<U>): LazyIterable<U> {
        const iter = this.i;
        return () => fn(typeof iter === "function" ? iter() : iter);
    }

    private chain<U>(fn: (i: GenIterable<T>) => GenIterable<U>): ImplSequence<U> {
        return new ImplSequence(this.inject(fn));
    }

    [Symbol.iterator]() {
        return this.iter[Symbol.iterator]();
    }

    next(): IteratorResult<T> {
        return this.iterator.next();
    }

    //// Filters
    filter(fnFilter: (t: T) => boolean): ImplSequence<T> {
        return this.chain(filter(fnFilter));
    }

    skip(n: number): ImplSequence<T> {
        return this.chain(skip(n));
    }

    take(n: number): ImplSequence<T> {
        return this.chain(take(n));
    }

    //// Extenders
    concat(j: Iterable<T>): ImplSequence<T> {
        return this.chain(concat(j));
    }

    concatMap<U>(fn: (t: T) => Iterable<U>): ImplSequence<U> {
        return this.chain(concatMap(fn));
    }

    //// Mappers
    combine<U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>): ImplSequence<V>  {
        return this.chain(combine(fn, j));
    }

    map<U>(fn: (t: T) => U): ImplSequence<U> {
        return this.chain(map(fn));
    }

    scan<U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue: U): ImplSequence<U> {
        return this.chain(scan(fnReduce, initValue));
    }

    pipe(): Sequence<T>;
    pipe<T1>(fn0: ChainFunction<T, T1>): Sequence<T1>;
    pipe<T1, T2>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>): Sequence<T2>;
    pipe<T1, T2, T3>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>, fn2: ChainFunction<T2, T3>): Sequence<T3>;
    pipe<T1, T2, T3, T4>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>, fn2: ChainFunction<T2, T3>, fn3: ChainFunction<T3, T4>): Sequence<T4>;
    pipe<T1, T2, T3, T4, T5>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>, fn2: ChainFunction<T2, T3>, fn3: ChainFunction<T3, T4>, fn4: ChainFunction<T4, T5>): Sequence<T5>;
    pipe<T1, T2, T3, T4, T5, T6>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>, fn2: ChainFunction<T2, T3>, fn3: ChainFunction<T3, T4>, fn4: ChainFunction<T4, T5>, fn5: ChainFunction<T5, T6>): Sequence<T6>;
    pipe<T1, T2, T3, T4, T5, T6>(fn0: ChainFunction<T, T1>, fn1: ChainFunction<T1, T2>, fn2: ChainFunction<T2, T3>, fn3: ChainFunction<T3, T4>, fn4: ChainFunction<T4, T5>, fn5: ChainFunction<T5, T6>, ...fnRest: ChainFunction<T6, T6>[]): Sequence<T6>;
    pipe(...fns: ChainFunction<T, T>[]): Sequence<T> {
        if (!fns.length) return this;
        // Casting workaround due to the spread operator not working See: https://github.com/microsoft/TypeScript/issues/28010
        return this.chain<T>(pipe.apply<unknown, any, ChainFunction<T, T>>(null, fns));
    }

    // Reducers
    all(fnFilter: (t: T) => boolean): boolean {
        return all(fnFilter)(this.iter);
    }

    any(fnFilter: (t: T) => boolean): boolean {
        return any(fnFilter)(this.iter);
    }

    count(): number {
        return count()(this.iter);
    }

    first(fnFilter: (t: T) => boolean, defaultValue: T): T {
        return first(fnFilter, defaultValue)(this.iter);
    }

    forEach(fn: (t: T, index: number) => void): void {
        return forEach(fn)(this.iter);
    }

    max(fnSelector?: (t: T) => T): Maybe<T>;
    max<U>(fnSelector: (t: T) => U): Maybe<T>  {
        return max(fnSelector)(this.iter);
    }

    min(fnSelector?: (t: T) => T): Maybe<T>
    min<U>(fnSelector: (t: T) => U): Maybe<T> {
        return min(fnSelector)(this.iter);
    }

    reduce<U>(fnReduce: (prevValue: U, curValue: T, curIndex: number) => U, initValue?: U) {
        return reduce<T, U>(fnReduce, initValue!)(this.iter);
    }

    reduceToSequence<U>(
        fnReduce: (previousValue: GenIterable<U>, currentValue: T, currentIndex: number) => GenIterable<U>,
        initialValue: GenIterable<U>
    ): ImplSequence<U>  {
        return this.chain(reduce<T, GenIterable<U>>(fnReduce, initialValue!));
    }

    //// Cast
    toArray() {
        return [...this.iter];
    }

    toIterable() {
        return toIterableIterator(this.iter);
    }
}
