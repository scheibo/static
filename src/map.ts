import * as path from 'path';

import * as fs from './fs';

export function map(root: string, domain: string, urls: string[]) {
  fs.write(path.join(root, 'sitemap.txt'), [domain, ...urls].join('\n'));
  fs.write(path.join(root, 'robots.txt'), `Sitemap: ${domain}sitemap.txt`);
}
