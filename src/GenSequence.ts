import { Sequence, GenIterable } from './types';
import { toIterableIterator } from './util/util';
import { ImplSequence } from './ImplSequence';

export { Sequence, GenIterable, AsyncGenIterable } from './types';
export { toIterableIterator } from './util/util';

export interface SequenceCreator<T> {
    (i: GenIterable<T>): Sequence<T>;
    fromObject: <U>(u: U) => Sequence<KeyValuePair<U>>;
}

export function genSequence<T>(i: () => GenIterable<T>): Sequence<T>;
export function genSequence<T>(i: GenIterable<T>): Sequence<T>;
export function genSequence<T>(i: (() => GenIterable<T>) | GenIterable<T>): Sequence<T> {
    return new ImplSequence(i);
}

// Collection of entry points into GenSequence
export const GenSequence = {
    genSequence,
    sequenceFromRegExpMatch,
    sequenceFromObject,
};

/**
 * alias of toIterableIterator
 */
export const toIterator = toIterableIterator;

export type KeyValuePair<T> = [keyof T, T[keyof T]];

export function* objectIterator<T>(t: T): IterableIterator<KeyValuePair<T>> {
    const keys = new Set(Object.keys(t));
    for (const k in t) {
        // istanbul ignore else
        if (keys.has(k)) {
            yield [k, t[k]] as KeyValuePair<T>;
        }
    }
}

export function objectToSequence<T>(t: T): Sequence<KeyValuePair<T>> {
    return sequenceFromObject<T>(t);
}


export function sequenceFromObject<T>(t: T): Sequence<KeyValuePair<T>> {
    return genSequence(() => objectIterator(t));
}

export function sequenceFromRegExpMatch(pattern: RegExp, text: string): Sequence<RegExpExecArray> {
    function* doMatch() {
        const regex = new RegExp(pattern);
        let match: RegExpExecArray | null;
        let lastIndex: number | undefined = undefined;
        while ( match = regex.exec(text) ) {
            // Make sure it stops if the index does not move forward.
            if (match.index === lastIndex) {
                break;
            }
            lastIndex = match.index;
            yield match;
        }
    }

    return genSequence(() => doMatch());
}

export default genSequence;
