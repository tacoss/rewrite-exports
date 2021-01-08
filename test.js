const vm = require('vm');
const expect = require('expect');
const rExports = require('.');

const supported = `

  export const complex = {
    value: 'OSOM',
  };

  export const stuff = 'red';
  export let x = false;

  export { name1, name2, nameN };
  export { variable1 as name1, variable2 as name2, nameN };

  export let let1, let2, letN;
  export let other1 = other2 = otherN;

  export function FunctionName() {
  }

  export class ClassName {
  }

  export { var1, var2, varN } from './src';
  export { import1 as extra1, import2 as extra2, extraN } from './src';

  export { default as OK } from './src';

  export default function () {  }
  export default function func1() {  }

  export { def1 as default };

  export * from './src';

  export { default } from './src';

  export default {
    GET(ctx) {
      doCall(ctx);
    }
  };

  export let a,b,c=0;

  let cssClass;
  export{cssClass as class}

  exported

  export const html = '<a href="#">OK</a>';

`;

const expected = `

  const complex = module.exports.complex = {
    value: 'OSOM',
  };

  const stuff = module.exports.stuff = 'red';
  let x = module.exports.x = false;

  Object.assign(module.exports, { name1, name2, nameN });
  Object.assign(module.exports, { name1: variable1, name2: variable2, nameN });

  let let1, let2, letN; Object.assign(module.exports, { let1, let2, letN });
  let other1 = module.exports.other1 = other2 = module.exports.other2 = otherN;

  const FunctionName = module.exports.FunctionName = function FunctionName() {
  }

  const ClassName = module.exports.ClassName = class ClassName {
  }

  const { var1, var2, varN } = require("./src"); Object.assign(module.exports, { var1, var2, varN });
  const { import1: extra1, import2: extra2, extraN } = require("./src"); Object.assign(module.exports, { extra1, extra2, extraN });

  module.exports.OK = require("./src");

  module.exports = function () {  }
  const func1 = module.exports = function func1() {  }

  module.exports = def1;

  module.exports = require("./src");

  module.exports = require("./src");

  module.exports = {
    GET(ctx) {
      doCall(ctx);
    }
  };

  let a = module.exports.a = b = module.exports.b = c = module.exports.c = 0;

  let cssClass;
  Object.assign(module.exports, {class: cssClass})

  exported

  const html = module.exports.html = '<a href="#">OK</a>';

`;

const args = [supported];

async function main() {
  expect(rExports(...args)).toEqual(expected);

  const env = {
    require: () => env,
    module: {},
    def1: null,
    name1: null,
    name2: null,
    nameN: null,
    otherN: null,
    exported: null,
    variable1: null,
    variable2: null,
  };

  const o = [];
  const d = {};
  Object.defineProperty(env.module, 'exports', {
    get: () => d,
    set: v => { o.push(v); },
  });

  await vm.runInNewContext(expected, env);
  expect(Object.keys(d).length).toEqual(25);
  expect(o.length).toEqual(6);
}

main().catch(e => {
  console.log(e.matcherResult ?  e.matcherResult.message() : e.message);
  process.exit(1);
});
