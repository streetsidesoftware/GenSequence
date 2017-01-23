
import {fib} from './fibonacci';
import {expect} from 'chai';

describe('validate fibonacci example', () => {
    it('test getting 5 values', () => {
        expect(fib(5)).to.be.deep.equal([1,1,2,3,5]);
    });

    it('tests getting the 5th value', () => {
        expect(fib(5)).to.be.deep.equal([1,1,2,3,5]);
    });
});