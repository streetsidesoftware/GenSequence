
export type Maybe<T> = T | undefined;

export interface IterableLike<T> {
    [Symbol.iterator](): Iterator<T> | IterableIterator<T>;
}

export interface UnaryFunction<T, R> { (source: T): R; }
export interface OperatorFunction<T, R> extends UnaryFunction<IterableIterator<T>, IterableIterator<R>> {}

