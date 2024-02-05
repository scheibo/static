// Based on the MIT licensed matklad/matklad.github.io:
// https://github.com/matklad/matklad.github.io/blob/master/LICENSE-MIT

import hljs from 'highlight.js';

export const styles = {
  light: `
  --hl-comment: #a0a1a7;
  --hl-keyword: #a626a4;
  --hl-name: #e45649;
  --hl-literal: #0184bb;
  --hl-string: #50a14f;
  --hl-number: #986801;
  --hl-symbol: #4078f2;
  --hl-builtin: #c18401;`,
  dark: `
  --hl-comment: #5c6370;
  --hl-keyword: #c678dd;
  --hl-name: #e06c75;
  --hl-literal: #56b6c2;
  --hl-string: #98c379;
  --hl-number: #d19a66;
  --hl-symbol: #61aeee;
  --hl-builtin: #e6c07b;`,
  highlight: `
.hl-keyword, .hl-literal, .hl-title.function_, .hl-title.class, .hl-built_in, .hl-meta {
  font-weight: bold;
}
.hl-comment, .hl-quote {
  color: var(--hl-comment);
  font-style: italic;
}
.hl-doctag, .hl-keyword, .hl-formula {
  color: var(--hl-keyword);
}
.hl-section, .hl-name, .hl-selector-tag, .hl-deletion, .hl-subst {
  color: var(--hl-name);
}
.hl-literal {
  color: var(--hl-literal);
}
.hl-string, .hl-regexp, .hl-addition, .hl-attribute, .hl-meta .hl-string {
  color: var(--hl-string);
}
.hl-attr, .hl-variable, .hl-template-variable, .hl-type,
.hl-selector-class, .hl-selector-attr, .hl-selector-pseudo, .hl-number {
  color: var(--hl-number);
}
.hl-symbol, .hl-bullet, .hl-link, .hl-meta, .hl-selector-id, .hl-title {
  color: var(--hl-symbol);
}
.hl-built_in, .hl-title.class_, .hl-class .hl-title {
  color: var(--hl-builtin);
}`,
};

hljs.configure({classPrefix: 'hl-'});
hljs.registerLanguage('Zig', () => ({
  name: 'Zig',
  aliases: ['zig'],
  keywords: 'pub align allowzero and asm async await break catch comptime|10 ' +
      'const continue defer else enum errdefer export extern false fn ' +
      'for if inline noalias null or orelse packed promise resume return ' +
      'linksection struct suspend nosuspend noinline callconv switch test ' +
      'threadlocal true try undefined union unreachable|10 usingnamespace ' +
      'var volatile while error',
  contains: [
    {className: 'literal', match: '(true|false|null|undefined)'},
    {
      className: 'string',
      variants: [{begin: '"', end: '"'}, {begin: "\\'", end: "\\'"}, {begin: '\\\\\\\\', end: '$'}],
      contains: [{
        className: 'string',
        variants: [
          {match: "\\\\([nrt'\"\\\\]|(x[0-9a-fA-F]{2})|(u\\{[0-9a-fA-F]+\\}))"},
          {match: '\\\\.'},
        ],
        relevance: 0,
      }],
      relevance: 0,
    },
    {
      className: 'comment',
      variants: [{begin: '//[!/](?=[^/])', end: '$'}, {begin: '//', end: '$'}],
      relevance: 0,
      contains: [{className: 'title', match: '\\b(TODO|FIXME|XXX|NOTE)\\b:?', relevance: 0}],
    },
    {
      className: 'type',
      variants: [{
        match: '\\b(f16|f32|f64|f128|u\\d+|i\\d+|isize|usize|comptime_int|comptime_float)\\b',
        relevance: 2,
      }, {
        match: '\\b(c_short|c_ushort|c_int|c_uint|c_long|' +
                  'c_ulong|c_longlong|c_ulonglong|c_longdouble|c_void)\\b',
        relevance: 1,
      },
      {
        match: '\\b(bool|void|noreturn|type|anyerror|anyframe|anytype)\\b',
        relevance: 0,
      }],
    },
    {
      className: 'function',
      variants: [{beginKeywords: 'fn', end: '([_a-zA-Z][_a-zA-Z0-9]*)', excludeBegin: !0}],
      relevance: 0,
    },
    {className: 'built_in', match: '@[_a-zA-Z][_a-zA-Z0-9]*'},
    {begin: '@import\\(', relevance: 10},
    {
      className: 'operator',
      variants: [
        {match: '\\[*c\\]'},
        {match: '(==|!=)'},
        {match: '(-%?|\\+%?|\\*%?|/|%)=?'},
        {match: '(<<%?|>>|!|&|\\^|\\|)=?'},
        {match: '(==|\\+\\+|\\*\\*|->)'},
      ],
      relevance: 0,
    },
    {
      className: 'numbers',
      variants: [
        {match: '\\b[0-9][0-9_]*(\\.[0-9][0-9_]*)?([eE][+-]?[0-9_]+)?\\b'},
        {match: '\\b[0-9][0-9_]*\\b'},
        {match: '\\b0x[a-fA-F0-9_]+\\b'},
        {match: '\\b0o[0-7_]+\\b'},
        {match: '\\b0b[01_]+\\b'},
      ],
      relevance: 0,
    }],
}));

export function highlight(source: string, language?: string) {
  if (!language) return source;
  if (language !== 'console') return hljs.highlight(source, {language}).value;
  let cont = false;
  const lines = source.trimEnd().split('\n').map((line) => {
    if (cont) {
      cont = line.endsWith('\\');
      return `${line}\n`;
    }
    if (line.startsWith('$ ')) {
      cont = line.endsWith('\\');
      return `<span class="hl-title function_">$</span> ${line.substring(2)}\n`;
    }
    if (line.startsWith('#')) return `<span class="hl-comment">${line}</span>\n`;
    return `<span class="hl-output">${line}</span>\n`;
  });
  return lines.join('\n');
}

