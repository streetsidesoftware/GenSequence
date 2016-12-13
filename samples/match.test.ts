
import * as match from './match';
import {expect} from 'chai';

describe('validate match', () => {
    it('tests the set of words', () => {
        expect(match.setOfWords).to.be.instanceOf(Set);
        expect([...match.setOfWords].sort()).to.be.deep.equal(['Some', 'bit', 'duplicate', 'long', 'many', 'of', 'text', 'with', 'words',]);
        expect([...match.setOfWords]).to.be.deep.equal(['Some', 'long', 'bit', 'of', 'text', 'with', 'many', 'words', 'duplicate',]);
        expect([...match.setOf4LetterWords]).to.be.deep.equal(['Some', 'long', 'text', 'with', 'many']);
    });
});

