import { ChainFunction, SequenceBuilder } from './util/types';
import { ImplSequenceBuilder } from './ImplSequenceBuilder';
import { filter, skip, take, concat, concatMap, combine, map, scan } from './operators';


function makeBuilder<T, U = T>(fn: ChainFunction<T, U>): SequenceBuilder<T, U> {
    return new ImplSequenceBuilder([fn]);
}

export const builder = Object.freeze({
    pipe: <T, U>(fn: ChainFunction<T, U>) => {
        return makeBuilder(fn);
    },

    //// Filters
    /** keep values where the fnFilter(t) returns true */
    filter: <T>(fnFilter: (t: T) => boolean) => {
        return makeBuilder(filter(fnFilter));
    },

    skip: <T>(n: number) => {
        return makeBuilder<T>(skip(n));
    },

    take: <T>(n: number) => {
        return makeBuilder<T>(take(n));
    },

    //// Extenders
    concat: <T>(j: Iterable<T>) => {
        return makeBuilder(concat(j));
    },

    concatMap: <T, U>(fn: (t: T) => Iterable<U>) => {
        return makeBuilder(concatMap(fn));
    },

    //// Mappers
    combine: <T, U, V>(fn: (t: T, u?: U) => V, j: Iterable<U>) => {
        return makeBuilder(combine(fn, j));
    },

    /** map values from type T to type U */
    map: <T, U>(fnMap: (t: T) => U) => {
        return makeBuilder(map(fnMap));
    },

    scan: <T, U>(fnReduce: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U) => {
        return makeBuilder(scan(fnReduce, initialValue));
    },
});
