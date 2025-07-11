# Release Notes

## [8.0.0](https://github.com/streetsidesoftware/GenSequence/compare/v7.0.0...v8.0.0) (2025-07-11)


### ⚠ BREAKING CHANGES

* drop support for Node 18 ([#717](https://github.com/streetsidesoftware/GenSequence/issues/717))

### Features

* drop support for Node 18 ([#717](https://github.com/streetsidesoftware/GenSequence/issues/717)) ([132a479](https://github.com/streetsidesoftware/GenSequence/commit/132a47910641f409a4b827a63c61426313384047))

## [7.0.0](https://github.com/streetsidesoftware/GenSequence/compare/v6.0.0...v7.0.0) (2024-02-27)


### ⚠ BREAKING CHANGES

* Drop support for CommonJS ([#487](https://github.com/streetsidesoftware/GenSequence/issues/487))
* Drop support for Node 16 ([#485](https://github.com/streetsidesoftware/GenSequence/issues/485))

### Features

* Drop support for CommonJS ([#487](https://github.com/streetsidesoftware/GenSequence/issues/487)) ([e0060d3](https://github.com/streetsidesoftware/GenSequence/commit/e0060d349daf23af74be1d7224ad715e6e89390c))
* Drop support for Node 16 ([#485](https://github.com/streetsidesoftware/GenSequence/issues/485)) ([333a3e9](https://github.com/streetsidesoftware/GenSequence/commit/333a3e991524d1737efcfddd7e728e44cb66f2b0))

## [6.0.0](https://github.com/streetsidesoftware/GenSequence/compare/v5.0.2...v6.0.0) (2023-08-24)


### ⚠ BREAKING CHANGES

* Drop support for Node 14 ([#380](https://github.com/streetsidesoftware/GenSequence/issues/380))

### Features

* Drop support for Node 14 ([#380](https://github.com/streetsidesoftware/GenSequence/issues/380)) ([6139f5f](https://github.com/streetsidesoftware/GenSequence/commit/6139f5f2fe772f329f104bc81cafed7d5d4896a2))

## [5.0.2](https://github.com/streetsidesoftware/GenSequence/compare/v5.0.1...v5.0.2) (2023-02-28)


### Bug Fixes

* Do not package redundant `.js` and `.d.ts` files ([cd5afd0](https://github.com/streetsidesoftware/GenSequence/commit/cd5afd05c7c3455e8dfc9bb54907b2656ebdbba5))

## [5.0.1](https://github.com/streetsidesoftware/GenSequence/compare/v5.0.0...v5.0.1) (2023-02-28)


### Bug Fixes

* do not package `.tsbuildInfo` ([4ae236f](https://github.com/streetsidesoftware/GenSequence/commit/4ae236fff538ff43ab03ee0070a680969b471694))

## [5.0.0](https://github.com/streetsidesoftware/GenSequence/compare/v4.0.3...v5.0.0) (2023-02-28)


### ⚠ BREAKING CHANGES

* Support ESM ([#283](https://github.com/streetsidesoftware/GenSequence/issues/283))

### Features

* Support ESM ([#283](https://github.com/streetsidesoftware/GenSequence/issues/283)) ([af15160](https://github.com/streetsidesoftware/GenSequence/commit/af15160385bcde7642cf10d1a0ea2ec3055897c4))

## [4.0.3](https://github.com/streetsidesoftware/GenSequence/compare/v4.0.2...v4.0.3) (2022-12-08)

### Bug Fixes

- Update TypeScript ([#257](https://github.com/streetsidesoftware/GenSequence/issues/257)) ([d7abd48](https://github.com/streetsidesoftware/GenSequence/commit/d7abd4872d4e5665bfc01d3650ae8bfde455d407))

## [4.0.2](https://github.com/streetsidesoftware/GenSequence/compare/v4.0.1...v4.0.2) (2022-08-30)

### Bug Fixes

- Fix Release ([82328ec](https://github.com/streetsidesoftware/GenSequence/commit/82328ecd09c59b4a6a9512f4236d55cf459861ea))

## [4.0.1](https://github.com/streetsidesoftware/GenSequence/compare/1.2.0...v4.0.1) (2022-08-30)

### Bug Fixes

- clean up the async reducers ([#21](https://github.com/streetsidesoftware/GenSequence/issues/21)) ([0bf7525](https://github.com/streetsidesoftware/GenSequence/commit/0bf75256eabeae936aeda32ad86a822a1d5bafcb))
- correctly handle `undefined` initial value. ([0bf7525](https://github.com/streetsidesoftware/GenSequence/commit/0bf75256eabeae936aeda32ad86a822a1d5bafcb))
- Sequence<T extends S> is type compatible with Sequence<S> ([#25](https://github.com/streetsidesoftware/GenSequence/issues/25)) ([2834953](https://github.com/streetsidesoftware/GenSequence/commit/2834953e20539edbaa41fb8323f61d81b717b0a6))
- Update Publication Process ([483732c](https://github.com/streetsidesoftware/GenSequence/commit/483732c03abe8da434f71666b6f57eb46a727135))
- Update Typescript ([#228](https://github.com/streetsidesoftware/GenSequence/issues/228)) ([ae21653](https://github.com/streetsidesoftware/GenSequence/commit/ae216534a6c0977f58d4f6389748aa0f2d387f41))

### Miscellaneous Chores

- release 4.0.1 ([391dc6d](https://github.com/streetsidesoftware/GenSequence/commit/391dc6dd026a39986ffbd3a1ed7fc1a17e37889d))

## [4.0.0]

- Drop support for Node 10 and 12.

## [3.1.0]

- Initial support for `AsyncIterator`s
  - Special thanks to [albertossilva (Alberto)](https://github.com/albertossilva)
  - Only supports reduce at the moment.

## [3.0.0]

- Supports Node >= 10
- Add the ability to pipe operators

## [2.2.0]

- Move operator functions out of GenSequence
- Update to TypeScript

## [2.1.3]

- Update dev packages to address issues with code coverage generation in Node 10

## 2.1.1

- Update dev packages
- add `forEach` function

## 2.1.0

- fix a function signature issue surfaced by typescript 2.4.2

## 2.0.1

- minor update to README.md.
- added test showing how it is not possible to reuse some iterators.

## 2.0.0

- sequences are now reusable as long as the original iterator is reusable.
- it is not possible to initialize a sequence with a function that returns an iterator
  This is very powerful.
- `.count()` added.
- special thanks to @sea1jxr for all of the above.

## 1.3.0

- Refactor the methods to give them a logical grouping - thanks to @sea1jxr

## 1.2.0

- Added `min` and `max` - thanks to @sea1jxr

## 1.1.0

- Added `all` and `any` - thanks to @sea1jxr

## 1.0.0

- Added full test coverage
- Fix an issue with scan and working with arrays.
- Fix the `.next()` function to correctly work with arrays.
- Sequence supports both Iterable<T> and IterableIterator<T> interfaces

## 0.1.0 - 0.2.4

- These were the initial set of releases

<!---
cspell:ignore albertossilva
-->
