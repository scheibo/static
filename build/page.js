"use strict";
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
exports.Renderer = void 0;
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
const clean_css_1 = __importDefault(require("clean-css"));
const html_minifier_1 = __importDefault(require("html-minifier"));
const template = __importStar(require("mustache"));
const fs = __importStar(require("./fs"));
const highlight_1 = require("./highlight");
const css = new clean_css_1.default();
const TEMPLATES = path.join(__dirname, '..', 'src', 'templates');
const BASE = fs.read(path.join(TEMPLATES, 'base.css'));
const LAYOUT = fs.read(path.join(TEMPLATES, 'layout.html'));
const OPTIONS = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    minifyCSS: true,
    quoteCharacter: '"',
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: true,
    sortAttributes: true,
    sortClassName: true,
};
const EXPIRY = process.env.NODE_ENV === 'development' ? 0 : 14 * (24 * 60 * 60 * 1000);
class Renderer {
    site;
    analytics;
    stylesheet = '';
    constructor(options) {
        this.site = options;
        this.analytics = Renderer.analytics(options.analytics);
    }
    create(name, page, replace) {
        fs.mkdir(path.join(this.site.public, name));
        const rendered = this.render({ id: path.basename(name), ...page }, replace);
        fs.write(path.join(this.site.public, name, 'index.html'), rendered);
    }
    render(page, replace) {
        if (!this.stylesheet) {
            const custom = { overrides: fs.read(this.site.stylesheet) };
            const data = this.site.highlight ? { ...highlight_1.styles, ...custom } : custom;
            const combined = template.render(BASE, data);
            const minified = css.minify(combined).styles;
            const hash = crypto.createHash('sha256').update(minified).digest('hex').slice(0, 8);
            this.stylesheet = `index.${hash}.css`;
            fs.write(path.join(this.site.public, this.stylesheet), minified);
        }
        const rendered = template.render(LAYOUT, {
            ...this.site,
            analytics: this.analytics,
            stylesheet: this.stylesheet,
            ...page,
        });
        const minified = html_minifier_1.default.minify(replace ? replace(rendered) : rendered, OPTIONS);
        return minified;
    }
    retain(file, now) {
        return path.basename(file) === this.stylesheet ||
            (/index\..*\.css$/.test(file) && +now - fs.stat(file).ctimeMs < EXPIRY);
    }
    static analytics(id) {
        return process.env.NODE_ENV === 'development' ? '' : `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
    </script>`;
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=page.js.map