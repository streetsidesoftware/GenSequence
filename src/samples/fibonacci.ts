import { genSequence, Sequence } from '../index.js';

export function fibonacci(): Sequence<number> {
    function* fib() {
        let [a, b] = [0, 1];
        while (true) {
            yield b;
            [a, b] = [b, a + b];
        }
    }
    return genSequence(fib());
}

export function fib(n: number) {
    return fibonacci()
        .take(n) // Take n from the fibonacci sequence
        .toArray(); // Convert it into an array
}

export const fib5 = fib(5); // [1, 1, 2, 3, 5]
