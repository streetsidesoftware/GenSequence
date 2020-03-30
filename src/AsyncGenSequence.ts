import { AsyncSequence, AsyncGenIterable } from './types';
import { ImplAsyncSequence } from './ImplAsyncSequence';

export function asyncGenSequence<T>(i: AsyncGenIterable<T>): AsyncSequence<T>;
export function asyncGenSequence<T>(i: () => AsyncGenIterable<T>): AsyncSequence<T>;
export function asyncGenSequence<T>(i: AsyncGenIterable<T> | (() => AsyncGenIterable<T>)): AsyncSequence<T> {
    return new ImplAsyncSequence(i);
}