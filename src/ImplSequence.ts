import { Sequence, GenIterable, Maybe } from './util/types';
import { filter, skip, take, concat, concatMap, combine, map, scan, all, any, count, first, forEach, max, min, reduce } from './operators';
import { toIterableIterator } from './util/util';

type LazyIterable<T> = (() => GenIterable<T>) | GenIterable<T>;

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
