import {execFileSync} from 'child_process';
import * as os from 'os';
import * as path from 'path';

import chokidar from 'chokidar';
import esbuild from 'esbuild';
import morgan from 'morgan';
import polka from 'polka';
import srv from 'serve-static';

export interface Directories {
  root: string;
  public?: string;
  static?: string;
  out?: string;
}

export function serve(port: number, root: string | Directories, fn?: (app: polka.Polka) => void) {
  const dirs = typeof root === 'string' ? {root} : root;
  dirs.static ??= path.join(dirs.root, 'static');

  const app = polka();

  app.use(morgan('dev'));
  app.use(srv(dirs.public ?? path.join(dirs.root, 'public')));

  const build = (file?: string) => {
    if (file) {
      const f = path.relative(dirs.root, file);
      console.log(`\x1b[2mRebuilding static after change to ${f} ...\x1b[0m`);
    }
    const begin = process.hrtime.bigint();
    try {
      const outdir = dirs.out ?? path.join(dirs.root, 'build');
      esbuild.buildSync({
        entryPoints: [path.join(dirs.static!, '*.ts')],
        outdir,
        bundle: false,
        platform: 'node',
        format: 'cjs',
        sourcemap: true,
      });
      const compile = `${(Math.round(Number(process.hrtime.bigint() - begin) / 1e6))} ms`;
      execFileSync('node', [`${outdir}/build.js`, '--rebuild'], {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: dirs.root,
      });
      const duration = (Number(process.hrtime.bigint() - begin) / 1e9).toFixed(2);
      if (file) console.log(`\x1b[2mRebuilt static in ${duration} s (${compile})\x1b[0m`);
    } catch (err: any) {
      const duration = (Number(process.hrtime.bigint() - begin) / 1e9).toFixed(2);
      console.error(`\x1b[31m${err.message.split('\n').slice(1, -1).join('\n')}\x1b[0m`);
      if (file) console.log(`\x1b[2mFailed build after ${duration} s\x1b[0m`);
    }
  };

  build();
  chokidar.watch(dirs.static).on('change', build);

  if (fn) fn(app);

  app.listen(port, () => {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('\x1b[33mAvailable on:\x1b[0m');
    const interfaces = os.networkInterfaces();
    for (const dev in interfaces) {
      for (const details of interfaces[dev]!) {
        if (details.family === 'IPv4') {
          console.log(`  http://${details.address}:\x1b[32m${port}\x1b[0m`);
        }
      }
    }
    console.log();
  });
}
