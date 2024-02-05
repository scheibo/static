// Based on the MIT licensed matklad/matklad.github.io:
// https://github.com/matklad/matklad.github.io/blob/master/LICENSE-MIT

import * as path from 'path';

import * as djot from '@djot/djot';
import type {AstNode, Visitor} from '@djot/djot/types/ast';
import katex from 'katex';

import {read} from './fs';
import {highlight} from './highlight';

const getChild = (node: AstNode, tag: string) => {
  if (!('children' in node) || !node.children) return undefined;
  for (const child of node.children) {
    if (child.tag === tag) return child;
  }
  return undefined;
};

const hasClass = (node: AstNode, cls: string) => {
  node.attributes = node.attributes || {};
  const attr = node.attributes?.['class'] || '';
  return attr.split(' ').includes(cls);
};

const addClass = (node: AstNode, cls: string) => {
  node.attributes = node.attributes || {};
  const attr = node.attributes['class'];
  node.attributes['class'] = attr ? `${attr} ${cls}` : cls;
};

const extract = (node: AstNode, attr: string, fn?: (raw: string) => string, raw?: boolean) => {
  if (!node.attributes?.[attr]) return '';
  const attrs = fn ? fn(node.attributes[attr]) : node.attributes[attr];
  const result = raw ? attrs : djot.renderHTML(djot.parse(attrs)).slice(3, -5);
  delete node.attributes[attr];
  return result;
};

const getStringContent = (node: AstNode) => {
  const buffer: string[] = [];
  addStringContent(node, buffer);
  return buffer.join('');
};

const trailing = (url: string) => {
  const [p, f] = url.split('#');
  return (p.endsWith('/') ? p : p + '/') + (f ? '#' + f : '');
};

const addStringContent = (node: AstNode, buffer: string[]) => {
  if ('text' in node) {
    buffer.push(node.text);
  } else if ('tag' in node && (node.tag === 'soft_break' || node.tag === 'hard_break')) {
    buffer.push('\n');
  } else if ('children' in node) {
    for (const child of node.children) {
      addStringContent(child, buffer);
    }
  }
};

interface Options {
  assets?: string;
  save?: {
    title?: string;
    summary?: string;
  };
  transform?: (raw: string) => string;
  overrides?: Visitor<djot.HTMLRenderer, string>;
}

export function render(raw: string, options: Options = {}) {
  let section: AstNode | undefined = undefined;
  return djot.renderHTML(djot.parse(options.transform ? options.transform(raw) : raw), {
    overrides: {
      link: (node, r) => {
        if (node.destination?.startsWith('/')) node.destination = trailing(node.destination);
        return r.renderAstNodeDefault(node);
      },
      section: (node, r) => {
        const previous = section;
        section = node;
        const child = getChild(node, 'heading');
        const result = child && 'level' in child && child.level === 1
          ? r.renderChildren(node)
          : r.renderAstNodeDefault(node);
        section = previous;
        return result;
      },
      heading: (node, r) => {
        if (node.level === 1) {
          if (options.save) {
            options.save.title = getStringContent(node);
            return '';
          }
          return r.renderAstNodeDefault(node);
        }
        const tag = `h${node.level}`;
        const id = section?.attributes?.id;
        const children = r.renderChildren(node);
        const attrs = r.renderAttributes(node);
        return (id
          ? `<${tag}${attrs}><a href="#${id}" class="subtle">${children}</a></${tag}>\n`
          : `<${tag}${attrs}>${children}</${tag}>\n`);
      },
      div: (node, r): string => {
        if (options.assets && hasClass(node, 'svg')) {
          return read(path.join(options.assets, extract(node, 'src', options.transform, true)));
        }
        if (hasClass(node, 'aside')) {
          node.attributes = node.attributes || {};
          const title = extract(node, 'title', options.transform);
          return `
            <aside${r.renderAttributes(node)}>
              <div class="title">${title}</div>
              ${r.renderChildren(node)}
            </aside>
          `;
        }
        if (hasClass(node, 'update')) {
          node.attributes = node.attributes || {};
          const time = extract(node, 'time', options.transform);
          return `
            <aside${r.renderAttributes(node)}>
              <div class="title">Update (<time>${time}</time>)</div>
              ${r.renderChildren(node)}
            </aside>
          `;
        }
        if (hasClass(node, 'details')) {
          return `
            <details><summary>${extract(node, 'summary', options.transform)}</summary>
              ${r.renderChildren(node)}
            </details>
          `;
        }
        return r.renderAstNodeDefault(node);
      },
      code_block: (node) => {
        const title = extract(node, 'title', options.transform);
        const cite = extract(node, 'cite', options.transform);
        const caption =
          title ? `<figcaption class="title">${title}</figcaption>`
          : cite ? `<figcaption class="cite"><cite>${cite}</cite></figcaption>` : '';
        return `
          <figure class="code">
            ${caption}
            <pre><code>${highlight(node.text, node.lang).trimEnd()}</code></pre>
          </figure>
        `;
      },
      para: (node, r) => {
        if (node.children.length === 1 && node.children[0].tag === 'image') {
          node.attributes = node.attributes || {};
          const caption = extract(node, 'caption', options.transform);
          return `
            <figure${r.renderAttributes(node)}>
              <figcaption class="title">${caption}</figcaption>
              ${r.renderChildren(node)}
            </figure>
          `;
        }
        const result = r.renderAstNodeDefault(node);
        if (options.save && !options.save.summary) options.save.summary = getStringContent(node);
        return result;
      },
      block_quote: (node, r) => {
        const cite = extract(node, 'cite', options.transform);
        const caption = cite ? `<figcaption class="cite"><cite>${cite}</cite></figcaption>` : '';
        return `
          <figure class="blockquote">
            <blockquote>${r.renderChildren(node)}</blockquote>
            ${caption}
          </figure>
        `;
      },
      span: (node, r) => {
        if (hasClass(node, 'code')) return `<code>${r.renderChildren(node)}</code>`;
        if (hasClass(node, 'dfn')) return `<dfn>${r.renderChildren(node)}</dfn>`;
        if (hasClass(node, 'kbd')) {
          const children = r.renderChildren(node).split('+').map(s => `<kbd>${s}</kbd>`).join('+');
          return `<kbd>${children}</kbd>`;
        }
        if (hasClass(node, 'email')) {
          const obfuscated = r.renderChildren(node).split('.').join('<b>.spam</b>.');
          return `<span class="email">${obfuscated}</span>`;
        }
        return r.renderAstNodeDefault(node);
      },
      url: (node, r) => {
        addClass(node, 'url');
        return r.renderAstNodeDefault(node);
      },
      inline_math: node => katex.renderToString(node.text, {output: 'mathml', displayMode: false}),
      display_math: node => katex.renderToString(node.text, {output: 'mathml', displayMode: true}),
      ...options.overrides},
  });
}
