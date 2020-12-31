const RE_KEYWORD = /(\bdefault\s+)?\b(let|const|class|function)\s+((\w+)(.*))$/i;
const RE_EXPORT = /^(\s*)export\s+([^\n;]*)/gmi;
const RE_FROM = /\bfrom\s+(["'])([^"']*)\1/gi;
const RE_DF = /\bdefault(\s+as\s+(\w+))?\b/i;
const RE_AS = /\b(\w+)\s+as\s+(\w+)\b/gi;
const RE_EQ = /\s*=\s*/;

function replaceExport(ctx, fn, x, f) {
  ctx = ctx || 'module.exports';
  fn = fn || 'require';
  x = x || 'Object.assign';

  return (_, left, tokens) => {
    let prefix = `${left}${ctx}`;

    const symbols = tokens.match(RE_KEYWORD);

    if (symbols) {
      if (symbols[2] === 'let' || symbols[2] === 'const') {
        let vars = symbols[3].split(RE_EQ);

        if (vars.length !== 1) {
          vars = vars.slice(0, vars.length - 1);
        }

        return `${left}${tokens}; ${symbols[2] === 'let' && f ? f(vars, ctx, fn, x) : `${x}(${ctx}, { ${vars.join(', ')} })`}`;
      }

      if (symbols[2] === 'class' || symbols[2] === 'function') {
        prefix = prefix.replace(left, `${left}const ${symbols[3].split(/[({\s]+/)[0]} = `);
      }

      if (!symbols[1]) {
        prefix += `.${symbols[4]}`;
      }
    }

    const def = tokens.match(RE_DF);

    if (tokens.match(RE_FROM)) {
      const vars = tokens.replace(RE_AS, '$2').replace(RE_FROM, '').trim();

      tokens = tokens.replace(RE_FROM, `= ${fn.replace(/[$]/g, '$&$&')}("$2")`);
      tokens = tokens.replace(RE_AS, '$1: $2');

      const req = tokens.split('=').pop().trim();

      if (vars === '*') {
        return `${prefix} = ${req}`;
      }

      if (def) {
        if (def[2]) {
          prefix += `.${def[2]}`;
        }

        return `${prefix} = ${req}`;
      }

      return `${left}const ${tokens}; ${x}(${ctx}, ${vars})`;
    }

    if (def) {
      if (symbols || !tokens.match(RE_AS)) {
        tokens = tokens.replace(RE_DF, '').trim();
      } else {
        tokens = tokens.match(RE_AS)[0].split(' ').shift();
      }
    } else {
      tokens = tokens.replace(RE_AS, '$2: $1');
    }

    if (!def && tokens.charAt() === '{') {
      return `${left}${x}(${ctx}, ${tokens})`;
    }

    return `${prefix} = ${tokens}`;
  };
}

module.exports = (code, ctx, fn, x, i) => code.replace(RE_EXPORT, replaceExport(ctx, fn, x, i));
