"use strict";
// Based on the MIT licensed matklad/matklad.github.io:
// https://github.com/matklad/matklad.github.io/blob/master/LICENSE-MIT
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const path = __importStar(require("path"));
const djot = __importStar(require("@djot/djot"));
const katex_1 = __importDefault(require("katex"));
const fs_1 = require("./fs");
const highlight_1 = require("./highlight");
const getChild = (node, tag) => {
    if (!('children' in node) || !node.children)
        return undefined;
    for (const child of node.children) {
        if (child.tag === tag)
            return child;
    }
    return undefined;
};
const hasClass = (node, cls) => {
    node.attributes = node.attributes || {};
    const attr = node.attributes?.['class'] || '';
    return attr.split(' ').includes(cls);
};
const addClass = (node, cls) => {
    node.attributes = node.attributes || {};
    const attr = node.attributes['class'];
    node.attributes['class'] = attr ? `${attr} ${cls}` : cls;
};
const extract = (node, attr, fn, raw) => {
    if (!node.attributes?.[attr])
        return '';
    const attrs = fn ? fn(node.attributes[attr]) : node.attributes[attr];
    const result = raw ? attrs : djot.renderHTML(djot.parse(attrs)).slice(3, -5);
    delete node.attributes[attr];
    return result;
};
const getStringContent = (node) => {
    const buffer = [];
    addStringContent(node, buffer);
    return buffer.join('');
};
const trailing = (url) => {
    const [p, f] = url.split('#');
    return (p.endsWith('/') ? p : p + '/') + (f ? '#' + f : '');
};
const addStringContent = (node, buffer) => {
    if ('text' in node) {
        buffer.push(node.text);
    }
    else if ('tag' in node && (node.tag === 'soft_break' || node.tag === 'hard_break')) {
        buffer.push('\n');
    }
    else if ('children' in node) {
        for (const child of node.children) {
            addStringContent(child, buffer);
        }
    }
};
function render(raw, options = {}) {
    let section = undefined;
    return djot.renderHTML(djot.parse(options.transform ? options.transform(raw) : raw), {
        overrides: {
            link: (node, r) => {
                if (node.destination?.startsWith('/'))
                    node.destination = trailing(node.destination);
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
            div: (node, r) => {
                if (options.assets && hasClass(node, 'svg')) {
                    return (0, fs_1.read)(path.join(options.assets, extract(node, 'src', options.transform, true)));
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
                const caption = title ? `<figcaption class="title">${title}</figcaption>`
                    : cite ? `<figcaption class="cite"><cite>${cite}</cite></figcaption>` : '';
                return `
          <figure class="code">
            ${caption}
            <pre><code>${(0, highlight_1.highlight)(node.text, node.lang).trimEnd()}</code></pre>
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
                if (options.save && !options.save.summary)
                    options.save.summary = getStringContent(node);
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
                if (hasClass(node, 'code'))
                    return `<code>${r.renderChildren(node)}</code>`;
                if (hasClass(node, 'dfn'))
                    return `<dfn>${r.renderChildren(node)}</dfn>`;
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
            inline_math: node => katex_1.default.renderToString(node.text, { output: 'mathml', displayMode: false }),
            display_math: node => katex_1.default.renderToString(node.text, { output: 'mathml', displayMode: true }),
            ...options.overrides
        },
    });
}
exports.render = render;
//# sourceMappingURL=html.js.map