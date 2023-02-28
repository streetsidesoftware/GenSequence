import { AsyncLazyIterable, AsyncSequence, ThenArg, AsyncIterableLike } from './types.js';
import { reduceAsyncForAsyncIterator } from './operators/index.js';

export class ImplAsyncSequence<T> implements AsyncSequence<T> {
    constructor(private i: AsyncLazyIterable<T>) {}

    private get iter() {
        return typeof this.i === 'function' ? this.i() : this.i;
    }

    [Symbol.asyncIterator]() {
        return this.iter[Symbol.asyncIterator]();
    }

    reduceAsync<U>(
        fnReduceAsync: (previousValue: ThenArg<U>, currentValue: ThenArg<T>, currentIndex: number) => ThenArg<U> | Promise<ThenArg<U>>,
        initialValue?: ThenArg<U>
    ): Promise<ThenArg<U>> {
        return reduceAsyncForAsyncIterator<T, U>(fnReduceAsync, initialValue)(this.iter as AsyncIterableLike<ThenArg<T>>);
    }
}
