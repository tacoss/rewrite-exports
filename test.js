const vm = require('vm');
const expect = require('expect');
const rExports = require('.');

const supported = `

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

  export function* generator1() {}
  export function * generator2() {}
  export function *generator3() {}
  export async function deferred() {}

  const value = 42;
  export {
    value
  };

  export { y\n} from './ref';

  const RE_EXPORT = 42;

`;

const expected = `

  module.exports=def1;

  module.exports=require("./src");

  module.exports=require("./src");

  module.exports={
    GET(ctx) {
      doCall(ctx);
    }
  };

  let a=module.exports.a=void 0,b=module.exports.b=void 0,c=module.exports.c=0;

  let cssClass;
  Object.assign(module.exports,{class:cssClass})

  exported

  const html=module.exports.html='<a href="#">OK</a>';

  const generator1=module.exports.generator1=function* generator1() {}
  const generator2=module.exports.generator2=function * generator2() {}
  const generator3=module.exports.generator3=function *generator3() {}
  const deferred=module.exports.deferred=async function deferred() {}

  const value = 42;
  Object.assign(module.exports,{value});

  const { y\n} =require("./ref");Object.assign(module.exports,{y});

  const RE_EXPORT = 42;

`;

const args = [supported];

function main() {
  expect(rExports('export {}')).toEqual('Object.assign(module.exports,{})');
  expect(rExports('export const x = {\ny:42}')).toEqual('const x=module.exports.x={\ny:42}');
  expect(rExports('export { name1, name2, nameN }')).toEqual('Object.assign(module.exports,{name1,name2,nameN})');
  expect(rExports('export { variable1 as name1, variable2 as name2, nameN }')).toEqual('Object.assign(module.exports,{name1:variable1,name2:variable2,nameN})');
  expect(rExports('export let let1, let2, letN')).toEqual('let let1, let2, letN;Object.assign(module.exports,{let1, let2, letN})');
  expect(rExports('export let other1 = other2 = otherN')).toEqual('let other1=module.exports.other1=void 0,other2=module.exports.other2=otherN');
  expect(rExports('export function FunctionName() {\n}')).toEqual('const FunctionName=module.exports.FunctionName=function FunctionName() {\n}');
  expect(rExports('export class ClassName {\n}')).toEqual('const ClassName=module.exports.ClassName=class ClassName {\n}');
  expect(rExports("export { default as OK } from './src'")).toEqual('module.exports.OK=require("./src")');
  expect(rExports("export { var1, var2, varN } from './src';")).toEqual('const { var1, var2, varN } =require("./src");Object.assign(module.exports,{var1,var2,varN});');
  expect(rExports("export { import1 as extra1, import2 as extra2, extraN } from './src';")).toEqual('const { import1:extra1, import2:extra2, extraN } =require("./src");Object.assign(module.exports,{extra1,extra2,extraN});');
  expect(rExports('export default function () {  }')).toEqual('module.exports=function () {  }');
  expect(rExports('export default function func1() {  }')).toEqual('const func1=module.exports=function func1() {  }');
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

  const d = {};
  Object.defineProperty(env.module, 'exports', {
    get: () => d,
    set: v => Object.assign(d, v),
  });

  vm.runInNewContext(expected, env);
  expect(Object.keys(d).length).toEqual(22);
}

try {
  main();
} catch (e) {
  console.log(e.matcherResult ? e.matcherResult.message() : e.message);
  process.exit(1);
}
