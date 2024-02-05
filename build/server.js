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
exports.serve = void 0;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const esbuild_1 = __importDefault(require("esbuild"));
const morgan_1 = __importDefault(require("morgan"));
const polka_1 = __importDefault(require("polka"));
const serve_static_1 = __importDefault(require("serve-static"));
function serve(port, root, fn) {
    const dirs = typeof root === 'string' ? { root } : root;
    dirs.static ??= path.join(dirs.root, 'static');
    const app = (0, polka_1.default)();
    app.use((0, morgan_1.default)('dev'));
    app.use((0, serve_static_1.default)(dirs.public ?? path.join(dirs.root, 'public')));
    const build = (file) => {
        if (file) {
            const f = path.relative(dirs.root, file);
            console.log(`\x1b[2mRebuilding static after change to ${f} ...\x1b[0m`);
        }
        const begin = process.hrtime.bigint();
        try {
            const outdir = dirs.out ?? path.join(dirs.root, 'build');
            esbuild_1.default.buildSync({
                entryPoints: [path.join(dirs.static, '*.ts')],
                outdir,
                bundle: false,
                platform: 'node',
                format: 'cjs',
                sourcemap: true,
            });
            const compile = `${(Math.round(Number(process.hrtime.bigint() - begin) / 1e6))} ms`;
            (0, child_process_1.execFileSync)('node', [`${outdir}/build.js`, '--rebuild'], {
                encoding: 'utf8',
                stdio: 'pipe',
                cwd: dirs.root,
            });
            const duration = (Number(process.hrtime.bigint() - begin) / 1e9).toFixed(2);
            if (file)
                console.log(`\x1b[2mRebuilt static in ${duration} s (${compile})\x1b[0m`);
        }
        catch (err) {
            const duration = (Number(process.hrtime.bigint() - begin) / 1e9).toFixed(2);
            console.error(`\x1b[31m${err.message.split('\n').slice(1, -1).join('\n')}\x1b[0m`);
            if (file)
                console.log(`\x1b[2mFailed build after ${duration} s\x1b[0m`);
        }
    };
    build();
    chokidar_1.default.watch(dirs.static).on('change', build);
    if (fn)
        fn(app);
    app.listen(port, () => {
        if (process.env.NODE_ENV !== 'development')
            return;
        console.log('\x1b[33mAvailable on:\x1b[0m');
        const interfaces = os.networkInterfaces();
        for (const dev in interfaces) {
            for (const details of interfaces[dev]) {
                if (details.family === 'IPv4') {
                    console.log(`  http://${details.address}:\x1b[32m${port}\x1b[0m`);
                }
            }
        }
        console.log();
    });
}
exports.serve = serve;
//# sourceMappingURL=server.js.map