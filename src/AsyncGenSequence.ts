import { AsyncSequence, AsyncGenIterable } from './types.js';
import { ImplAsyncSequence } from './ImplAsyncSequence.js';

export function asyncGenSequence<T>(i: AsyncGenIterable<T>): AsyncSequence<T>;
export function asyncGenSequence<T>(i: () => AsyncGenIterable<T>): AsyncSequence<T>;
export function asyncGenSequence<T>(i: AsyncGenIterable<T> | (() => AsyncGenIterable<T>)): AsyncSequence<T> {
    return new ImplAsyncSequence(i);
}
