import * as crypto from 'crypto';
import * as path from 'path';

import CSS from 'clean-css';
import html from 'html-minifier';
import * as template from 'mustache';

import * as fs from './fs';
import {styles} from './highlight';

const css = new CSS();

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

export interface Site {
  public: string;
  description: string;
  url: string;
  analytics: string;
  stylesheet: string;
  highlight?: boolean;
}

export interface Page {
  title: string;
  path: string;
  style?: string;
  id?: string;
  header?: string;
  content: string;
  script?: string;
}

const EXPIRY = process.env.NODE_ENV === 'development' ? 0 : 14 * (24 * 60 * 60 * 1000);

export class Renderer {
  private readonly site: Site;
  private readonly analytics: string;

  private stylesheet: string = '';

  constructor(options: Site) {
    this.site = options;
    this.analytics = Renderer.analytics(options.analytics);
  }

  create(name: string, page: Page, replace?: (s: string) => string) {
    fs.mkdir(path.join(this.site.public, name));
    const rendered = this.render({id: path.basename(name), ...page}, replace);
    fs.write(path.join(this.site.public, name, 'index.html'), rendered);
  }

  render(page: Page, replace?: (s: string) => string) {
    if (!this.stylesheet) {
      const custom = {overrides: fs.read(this.site.stylesheet)};
      const data = this.site.highlight ? {...styles, ...custom} : custom;
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
    const minified = html.minify(replace ? replace(rendered) : rendered, OPTIONS);
    return minified;
  }

  retain(file: string, now: Date) {
    return path.basename(file) === this.stylesheet ||
      (/index\..*\.css$/.test(file) && +now - fs.stat(file).ctimeMs < EXPIRY);
  }

  private static analytics(id: string) {
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
