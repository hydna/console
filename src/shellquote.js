function shellQuoteQuote (xs) {
  return xs.map(function (s) {
    if (s && typeof s === 'object') {
      return s.op.replace(/(.)/g, '\\$1');
    }
    else if (/["\s]/.test(s) && !/'/.test(s)) {
      return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
    }
    else if (/["'\s]/.test(s)) {
      return '"' + s.replace(/(["\\$`(){}!#&*|])/g, '\\$1') + '"';
    }
    else {
      return s.replace(/([\\$`(){}!#&*|])/g, '\\$1');
    }
  }).join(' ');
};

var CONTROL = '(?:' + [
    '\\|\\|', '\\&\\&', ';;', '\\|\\&', '[&;()|<>]'
].join('|') + ')';

var META = '|&;()<> \\t';

var TOKEN = '';

for (var i = 0; i < 4; i++) {
    TOKEN += (Math.pow(16,8)*Math.random()).toString(16);
}

function shellQuoteParse (s, env) {
  var mapped = _shellQuoteParse(s, env);
  if (typeof env !== 'function') return mapped;
  return mapped.reduce(function (acc, s) {
    if (typeof s === 'object') return acc.concat(s);
    var xs = s.split(RegExp('(' + TOKEN + '.*?' + TOKEN + ')', 'g'));
    if (xs.length === 1) return acc.concat(xs[0]);
    return acc.concat(xs.filter(Boolean).map(function (x) {
      if (RegExp('^' + TOKEN).test(x)) {
        return JSON.parse(x.split(TOKEN)[1]);
      }
      else return x;
    }));
  }, []);
};

function _shellQuoteParse (s, env) {
  var chunker = new RegExp([
      '([\'"])((\\\\\\1|[^\\1])*?)\\1', // quotes
      '(\\\\[' + META + ']|[^\\s' + META + '])+', // barewords
      '(' + CONTROL + ')' // control chars
  ].join('|'), 'g');
  var match = s.match(chunker);
  if (!match) return [];
  if (!env) env = {};
  return match.map(function (s) {
    if (/^'/.test(s)) {
      return s.replace(/^'|'$/g, '')
              .replace(/\\(["'\\$`(){}!#&*|])/g, '$1');
    }
    else if (/^"/.test(s) && typeof env === 'function') {
      return s.replace(/^"|"$/g, '')
              .replace(/(^|[^\\])\$(\w+|[*@#?$!0_-])/g, getVar)
              .replace(/(^|[^\\])\${(\w+|[*@#?$!0_-])}/g, getVar)
              .replace(/\\([ "'\\$`(){}!#&*|])/g, '$1');
    }
    else if (/^"/.test(s)) {
      return s.replace(/^"|"$/g, '')
              .replace(/(^|[^\\])\$(\w+|[*@#?$!0_-])/g, getVar)
              .replace(/(^|[^\\])\${(\w+|[*@#?$!0_-])}/g, getVar)
              .replace(/\\([ "'\\$`(){}!#&*|])/g, '$1');
    }
    else if (RegExp('^' + CONTROL + '$').test(s)) {
        return { op: s };
    }
    else return s.replace(/(['"])((\\\1|[^\1])*?)\1|[^'"]+/g, function (s, q) {
          if (/^['"]/.test(s)) return _shellQuoteParse(s, env);
          return _shellQuoteParse('"' + s + '"', env);
        }
    );
  });
  
  function getVar (_, pre, key) {
    var r = typeof env === 'function' ? env(key) : env[key];
    if (r === undefined) r = '';
    
    if (typeof r === 'object') {
        return pre + TOKEN + JSON.stringify(r) + TOKEN;
    }
    else return pre + r;
  }
};
