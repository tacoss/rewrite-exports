const RE_KEYWORD = /(\bdefault\s+)?\b(let|const|class|function(?:\s*\*)?)\s+(\*?[$\s\d\w,.=]+)([\s\S]*?)$/i;
const RE_EXPORT = /(^|\s*)export(?!\w)\s*(\{[^{}]*?\}.*?(?=;\n?|$)|[^]*?(?=[\n;]|$))/gi;
const RE_FROM = /\bfrom\s+(["'])([^"']*)\1/gi;
const RE_DF = /\bdefault(\s+as\s+(\w+))?\b/i;
const RE_AS = /\b(\w+)\s+as\s+(\w+)\b/gi;
const RE_EQ = /\s*=\s*/;

function allVars(chunks) {
  if (typeof chunks === 'string') return allVars(chunks.replace(/{|}/g, '').split(/\s*,\s*/).map(x => x.trim()));
  return chunks.reduce((memo, text) => memo.concat(text.split(/\s*,\s*/).map(x => x.trim())), []);
}

function mapVars(tokens) {
  return tokens.replace(/[{\s}]+/g, '').split(',').reduce((memo, k) => Object.assign(memo, { [k.split(':')[0]]: k.split(':')[1] }), {});
}

function replaceExport(ctx, fn, x, f) {
  ctx = ctx || 'module.exports';
  fn = fn || 'require';
  x = x || 'Object.assign';

  return (_, left, tokens) => {
    let prefix = `${left}${ctx}`;

    const symbols = tokens.match(RE_KEYWORD);

    if (symbols) {
      if (symbols[2] === 'let' || symbols[2] === 'const') {
        let vars = symbols[3].split(RE_EQ).filter(Boolean);
        let last = '';

        if (vars.length !== 1) {
          last = vars[vars.length - 1];
          vars = vars.slice(0, vars.length - 1);
        }

        if (!symbols[3].includes('=') && symbols[3].includes(',')) {
          return `${left}${tokens};${symbols[2] === 'let' && f ? f('let', allVars(vars), null, ctx, fn, x) : `${x}(${ctx},{${vars.join(',')}})`}`;
        }

        if (vars[0].includes(',')) {
          vars = vars[0].split(/\s*,\s*/);
        }
        return `${left}${symbols[2]} ${vars.map(x => `${x}=${ctx}.${x}`).join('=')}=${last}${symbols[4]}`;
      }

      if (symbols[2] === 'class' || symbols[2].includes('function')) {
        prefix = prefix.replace(left, `${left}const ${symbols[3].split(/[({\s]+/)[0].replace('*', '')}=`);
      }

      if (!symbols[1]) {
        prefix += `.${symbols[3].trim().replace('*', '')}`;
      }
    }

    const def = tokens.match(RE_DF);

    if (tokens.match(RE_FROM)) {
      const vars = tokens.replace(RE_AS, '$2').replace(RE_FROM, '').replace(/\s+/g, '');
      let mod;

      tokens = tokens.replace(RE_FROM, (_, q, src) => `=${fn}("${mod = src}")`);
      tokens = tokens.replace(RE_AS, '$1:$2');

      const req = tokens.split(RE_EQ).pop().trim();

      if (vars === '*') {
        return `${prefix}=${f ? f('*', req, mod, ctx, fn, x) : req}`;
      }

      if (def) {
        if (def[2]) {
          prefix += `.${def[2]}`;
        }

        return `${prefix}=${f ? f('default', req, mod, ctx, fn, x) : req}`;
      }

      return `${left}const ${tokens};${f ? f('const', allVars(vars), mod, ctx, fn, x) : `${x}(${ctx},${vars})`}`;
    }

    if (def) {
      if (symbols || !tokens.match(RE_AS)) {
        tokens = tokens.replace(RE_DF, '').trim();
      } else {
        tokens = tokens.match(RE_AS)[0].split(' ').shift();
      }
    } else {
      tokens = tokens.replace(RE_AS, '$2:$1');
    }

    if (!def && tokens.charAt() === '{') {
      if (tokens.includes('}')) {
        return `${left}${f ? f('object', mapVars(tokens), null, ctx, fn, x) : `${x}(${ctx},${tokens.replace(/\s+/g, '')})`}`;
      }
      return `${left}${ctx}=${tokens}`;
    }
    return `${prefix}=${tokens}`;
  };
}

module.exports = (code, ctx, fn, x, i) => code.replace(RE_EXPORT, replaceExport(ctx, fn, x, i));
