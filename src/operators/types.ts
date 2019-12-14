export type Maybe<T> = T | undefined;

export interface IterableLike<T> {
    [Symbol.iterator](): Iterator<T> | IterableIterator<T>;
}