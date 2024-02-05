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
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = exports.write = exports.read = exports.stat = exports.exists = exports.remove = exports.cpdir = exports.mkdir = exports.list = void 0;
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const prefix = `${path.basename(process.cwd())}-`;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
process.on('exit', () => fs.rmSync(TMP, { recursive: true, force: true }));
const list = (dir) => fs.readdirSync(dir);
exports.list = list;
const mkdir = (dir) => fs.mkdirSync(dir, { recursive: true });
exports.mkdir = mkdir;
const cpdir = (src, dst) => fs.cpSync(src, dst, { recursive: true });
exports.cpdir = cpdir;
const remove = (file) => fs.rmSync(file, { recursive: true, force: true });
exports.remove = remove;
const exists = (file) => fs.existsSync(file);
exports.exists = exists;
const stat = (file) => fs.statSync(file);
exports.stat = stat;
const read = (file) => fs.readFileSync(file, 'utf8');
exports.read = read;
const write = (file, data) => {
    const tmp = path.join(TMP, crypto.randomBytes(16).toString('hex'));
    try {
        fs.writeFileSync(tmp, data, { flag: 'wx' });
        fs.renameSync(tmp, file);
    }
    finally {
        (0, exports.remove)(tmp);
    }
};
exports.write = write;
const copy = (src, dst) => {
    const tmp = path.join(TMP, crypto.randomBytes(16).toString('hex'));
    try {
        fs.copyFileSync(src, tmp, fs.constants.COPYFILE_EXCL);
        fs.renameSync(tmp, dst);
    }
    finally {
        (0, exports.remove)(tmp);
    }
};
exports.copy = copy;
//# sourceMappingURL=fs.js.map