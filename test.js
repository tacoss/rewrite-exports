const rExports = require('.');

const supported = `

  export const stuff = 'red';
  export let x = false;

  export { name1, name2, nameN };
  export { variable1 as name1, variable2 as name2, nameN };

  export let name1, name2, nameN;
  export let name1 = name2 = nameN;

  export function FunctionName() {
  }

  export class ClassName {
  }

  export { name1, name2, nameN } from './src';
  export { import1 as name1, import2 as name2, nameN } from './src';

  export { default as OK } from './src';

  export default function () {  }
  export default function name1() {  }

  export { name1 as default };

  export * from './src';

  export { default } from './src';

  export default {
    GET(ctx) {
      doCall(ctx);
    }
  };

`;

const expected = `

  const stuff = 'red'; Object.assign(module.exports, { stuff });
  let x = false; Object.assign(module.exports, { x });

  Object.assign(module.exports, { name1, name2, nameN });
  Object.assign(module.exports, { name1: variable1, name2: variable2, nameN });

  let name1, name2, nameN; Object.assign(module.exports, { name1, name2, nameN });
  let name1 = name2 = nameN; Object.assign(module.exports, { name1, name2 });

  const FunctionName = module.exports.FunctionName = function FunctionName() {
  }

  const ClassName = module.exports.ClassName = class ClassName {
  }

  const { name1, name2, nameN } = require("./src"); Object.assign(module.exports, { name1, name2, nameN });
  const { import1: name1, import2: name2, nameN } = require("./src"); Object.assign(module.exports, { name1, name2, nameN });

  module.exports.OK = require("./src");

  module.exports = function () {  }
  const name1 = module.exports = function name1() {  }

  module.exports = name1;

  module.exports = require("./src");

  module.exports = require("./src");

  module.exports = {
    GET(ctx) {
      doCall(ctx);
    }
  };

`;

const args = [supported];

if (rExports(...args) !== expected) {
  process.stderr.write('\r[rewrite-exports] Failed test!\n');
  process.stderr.write(rExports(...args));
  process.exit(1);
}
