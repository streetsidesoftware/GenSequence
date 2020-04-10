import { Sequence } from '.';
import genSequence from './GenSequence';

interface Base {
    a: string;
    b: number;
}

interface Child extends Base {
    c: number;
}

describe('Basic Validation', () => {
    it('Ensure that Sequence<Child> can be passed to Sequence<Base>', () => {
        function processBase(s: Sequence<Base>): number {
            return s.reduce((a, b) => a + b.b, 0);
        }
        const children: Child[] = [ { a: 'a', b: 42, c: 1 }, { a: 'a', b: 43, c: 2 } ];
        const s = genSequence(children);
        const t = processBase(s);
        expect(t).toBe(85);
    });
});
