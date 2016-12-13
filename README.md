# GenSequence
Small library to simplify working with Generators and Iterators in Javascript / Typescript

Javascript (generators)[https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Generator], (Iterators and Generators)[https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Iterators_and_Generators]
are very exciting and provide some powerful new ways to solve programming problems.

The purpose of this library is to make using the result of a generator easier to use.  It is not intended as a replacement for array and
the convenient [...genFn()] notation.  GenSequence is useful for cases where you might not was an array of all possible values.

## Installation

`npm install -S gensequence`

## Usage

### Javascript
`import GenSequence from "GenSequence";`
or
`import { GenSequence } from "GenSequence";`


### Typescript
`import {GenSequence} from 'GenSequence';`

## Examples

### Fibonacci
The Fibonacci sequence can be very simply expressed using a generator.  Yet using the result of a generator can be a bit convoluted.
GenSequence provides a wrapper to add familiar functionality similar to arrays.

```javascript
function fibonacci() {
    function* fib() {
        let [a, b] = [0, 1];
        while (true) {
            yield b;
            [a, b] = [b, a + b];
        }
    }
    // Wrapper the Iterator result from calling the generator.
    return GenSequence(fib());
}

let fib5 = fibonacci()
    .take(5)            // Take the first 5 from the fibonacci sequence
    .toArray();         // Convert it into an array
// fib5 == [1, 1, 2, 3, 5]

let fib6n7seq = fibonacci().skip(5).take(2);
let fib6n7arr = [...fib6n7seq];                 // GenSequence are easily converted into arrays.

let fib5th = fibonacci()
    .skip(4)            // Skip the first 4
    .first();           // Return the next one.
```

### RegEx Match

Regular expressions are wonderfully powerful.  Yes, working with the results can sometimes be a bit of a pain.

```javascript
function* execRegEx(reg: RegExp, text: string) {
    const regLocal = new RegExp(reg);
    let r;
    while (r = regLocal.exec(text)) {
        yield r;
    }
}

function match(reg: RegExp, text: string) {
    return GenSequence(execRegEx(reg, text))
        // extract the full match
        .map(a => a[0]);
}

function matchWords(text: string) {
    return GenSequence(match(/\w+/g, text));
}

export function toSetOfWords(text: string) {
    // GenSequence can be used directly with a Set or Match
    return new Set(matchWords(text));
}

export const text = 'Some long bit of text with many words, duplicate words...';
export const setOfWords = toSetOfWords(text);
// Walk through the set of words and pull out the 4 letter one.
export const setOf4LetterWords = new Set(GenSequence(setOfWords).filter(a => a.length === 4));

```


## Reference

- `GenSequence(Iterable|Array)` -- decorate an Iterable or Array with the following functions.
- `.toArray()` -- convert the sequence into an array.  This is the same as [...iterator].
- `.map(fn)` -- just like array.map, allows you to convert the values in a sequence.
- `.filter(fn)` -- just like array.filter, filters the sequence
- `.reduce(fn, init?)` -- just like array.reduce, reduces the sequence into a single result.
- `.scan(fn, init?)` -- similar to reduce, but returns a sequence of all the results of fn.
- `.combine(fnCombiner, iterable)` -- is used to combine values from two different lists.
- `.concat(iterable)` -- this will extend the current sequence with the values from *iterable*
- `.concatMap(fnMap)` -- this is used to flatten the result of a map function.
- `.skip(n)` -- skip *n* entries in the sequence
- `.take(n)` -- take the next *n* entries in the sequence.
- `.first()` -- return the next value in the sequence.
- `.first(fn)` -- return the next value in the sequence where *fn(value)* return true.

### Misc
- `toIterable()` -- Casts a GenSequence into an IterableIterator - used in cases where type checking is too strict.
