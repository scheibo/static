import * as path from 'path';

import * as template from 'mustache';

import * as fs from './fs';
import {map} from './map';

const TEMPLATES = path.join(__dirname, '..', 'src', 'templates');
const FEED = fs.read(path.join(TEMPLATES, 'feed.xml'));
const ENTRY = fs.read(path.join(TEMPLATES, 'entry.xml'));

export interface Feed {
  url: string;
  updated: string;
  title: string;
  subtitle: string;
  author: string;
  entries: Entry[];
}

export interface Entry {
  title: string;
  date: string;
  updated?: string;
  summary: string;
  content: string;
  url: string;
  author: string;
}

export function render(root: string, data: Feed) {
  const entries = [];
  const urls = [];
  for (const entry of data.entries) {
    urls.push(entry.url);
    entries.push(template.render(ENTRY, {...entry, updated: entry.updated ?? entry.date}));
  }
  map(root, data.url, urls);
  fs.write(path.join(root, 'feed.xml'), template.render(FEED, {...data, entries}));
}
