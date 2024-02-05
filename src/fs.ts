import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const prefix = `${path.basename(process.cwd())}-`;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
process.on('exit', () => fs.rmSync(TMP, {recursive: true, force: true}));

export const list = (dir: string) => fs.readdirSync(dir);
export const mkdir = (dir: string) => fs.mkdirSync(dir, {recursive: true});
export const cpdir = (src: string, dst: string) => fs.cpSync(src, dst, {recursive: true});
export const remove = (file: string) => fs.rmSync(file, {recursive: true, force: true});
export const exists = (file: string) => fs.existsSync(file);
export const stat = (file: string) => fs.statSync(file);
export const read = (file: string) => fs.readFileSync(file, 'utf8');
export const write = (file: string, data: string | NodeJS.ArrayBufferView) => {
  const tmp = path.join(TMP, crypto.randomBytes(16).toString('hex'));
  try {
    fs.writeFileSync(tmp, data, {flag: 'wx'});
    fs.renameSync(tmp, file);
  } finally {
    remove(tmp);
  }
};
export const copy = (src: string, dst: string) => {
  const tmp = path.join(TMP, crypto.randomBytes(16).toString('hex'));
  try {
    fs.copyFileSync(src, tmp, fs.constants.COPYFILE_EXCL);
    fs.renameSync(tmp, dst);
  } finally {
    remove(tmp);
  }
};
