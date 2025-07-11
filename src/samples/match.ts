import { genSequence } from '../GenSequence.js';

function matchWords(text: string) {
    return genSequence(text.matchAll(/\w+/g)).map((a) => a[0]);
}

export function toSetOfWords(text: string) {
    return new Set(matchWords(text));
}

export const text = 'Some long bit of text with many words, duplicate words...';
export const setOfWords = toSetOfWords(text);
// Walk through the set of words and pull out the 4 letter one.
export const setOf4LetterWords = new Set(genSequence(setOfWords).filter((a) => a.length === 4));
