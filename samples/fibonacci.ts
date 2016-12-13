import { GenSequence } from '../src/GenSequence';

export function fibonacci() {
    function* fib() {
        let [a, b] = [0, 1];
        while (true) {
            yield b;
            [a, b] = [b, a + b];
        }
    }
    return GenSequence(fib());
}


export function fib(n: number) {
    return fibonacci()
        .take(n)            // Take n from the fibonacci sequence
        .toArray();         // Convert it into an array
}

const fib5 = fib(5); // [1, 1, 2, 3, 5]
