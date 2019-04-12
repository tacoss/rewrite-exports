
# rewrite-exports [![Build Status](https://travis-ci.org/pateketrueke/rewrite-exports.svg?branch=master)](https://travis-ci.org/pateketrueke/rewrite-exports)

Transforms various `export` statements into `module.exports` definitions, using regular expressions.

> Heavily inspired by [rewrite-imports](https://www.npmjs.com/package/rewrite-imports) and meant to be complementary!

## Install

```
$ npm install --save rewrite-exports
```

## Usage

```js
const  rExports  =  require('rewrite-exports');

rExports('export default 42');
//=> module.exports = 42

rExports('export default function () {  }');
//=> module.exports = function () {  }

rExports('export { default } from "./src";');
//=> module.exports = require("./src");
```

> Examine the `test.js` file to see all supported variations.

## API

### rExports(input)

#### input
Type: `String`

The `export` statement(s) or the code containing `export` statement(s).

> See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) for valid `export` statement syntax.
