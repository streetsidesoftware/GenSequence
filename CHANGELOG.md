# Release Notes

## 2.0.0
* sequences are now reusable as long as the original iterator is reusable.
* it is not possible to initialize a sequence with a function that returns an iterator
  This is very powerful.
* `.count()` added.
* special thanks to @sea1jxr for all of the above.

## 1.3.0
* Refactor the methods to give them a logical grouping - thanks to @sea1jxr

## 1.2.0
* Added `min` and `max` - thanks to @sea1jxr

## 1.1.0
* Added `all` and `any` - thanks to @sea1jxr

## 1.0.0
* Added full test coverage
* Fix an issue with scan and working with arrays.
* Fix the `.next()` function to correctly work with arrays.
* Sequence supports both Iterable<T> and IterableIterator<T> interfaces

## 0.1.0 - 0.2.4
* These were the initial set of releases
