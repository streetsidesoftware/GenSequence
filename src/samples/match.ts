import { genSequence } from '../GenSequence.js';

function* execRegEx(reg: RegExp, text: string) {
    const regLocal = new RegExp(reg);
    let r;
    while ((r = regLocal.exec(text))) {
        yield r;
    }
}

function match(reg: RegExp, text: string) {
    return (
        genSequence(execRegEx(reg, text))
            // extract the full match
            .map((a) => a[0])
    );
}

function matchWords(text: string) {
    return genSequence(match(/\w+/g, text));
}

export function toSetOfWords(text: string) {
    return new Set(matchWords(text));
}

export const text = 'Some long bit of text with many words, duplicate words...';
export const setOfWords = toSetOfWords(text);
// Walk through the set of words and pull out the 4 letter one.
export const setOf4LetterWords = new Set(genSequence(setOfWords).filter((a) => a.length === 4));
