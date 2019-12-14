export function toIterator<T>(values: Iterable<T> | IterableIterator<T>) {
    let iter: Iterator<T> | IterableIterator<T> | undefined;

    const rangeIterator = {
       next: function() {
           if (!iter) {
               iter = values[Symbol.iterator]();
           }
           return iter.next();
       }
    };
    return rangeIterator;
}

export function* toIterableIterator<T>(i: Iterable<T>) {
    yield* i;
}
