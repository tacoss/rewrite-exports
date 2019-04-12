const rExports = require('.');

const supported = `

  export { name1, name2, nameN };
  export { variable1 as name1, variable2 as name2, nameN };

  export let name1, name2, nameN;
  export let name1 = name2 = nameN;

  export function FunctionName() {
  }

  export class ClassName {
  }

  export default expression;
  export default function () {  }
  export default function name1() {  }

  export { name1 as default };

  export * from './src';

  export { default } from './src';
  export { default as OK } from './src';
  export { name1, name2, nameN } from './src';
  export { import1 as name1, import2 as name2, nameN } from './src';

`;

const expected = `

  module.exports = { name1, name2, nameN };
  module.exports = { name1: variable1, name2: variable2, nameN };

  let name1, name2, nameN; module.exports = { name1, name2, nameN };
  let name1 = name2 = nameN; module.exports = { name1, name2, nameN };

  module.exports.FunctionName = function FunctionName() {
  }

  module.exports.ClassName = class ClassName {
  }

  module.exports = expression;
  module.exports = function () {  }
  module.exports = function name1() {  }

  module.exports = name1;

  module.exports = require("./src");

  module.exports = require("./src");
  module.exports.OK = require("./src");
  const { name1, name2, nameN } = require("./src"); module.exports = { name1, name2, nameN };
  const { import1: name1, import2: name2, nameN } = require("./src"); module.exports = { name1, name2, nameN };

`;

if (rExports(supported) !== expected) {
  process.stderr.write('\r[rewrite-exports] Failed test!\n');
  process.stderr.write(rExports(supported));
  process.exit(1);
}
