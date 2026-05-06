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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
const path = __importStar(require("path"));
const template = __importStar(require("mustache"));
const fs = __importStar(require("./fs"));
const map_1 = require("./map");
const TEMPLATES = path.join(__dirname, '..', 'src', 'templates');
const FEED = fs.read(path.join(TEMPLATES, 'feed.xml'));
const ENTRY = fs.read(path.join(TEMPLATES, 'entry.xml'));
function render(root, data) {
    const entries = [];
    const urls = [];
    for (const entry of data.entries) {
        urls.push(entry.url);
        entries.push(template.render(ENTRY, { ...entry, updated: entry.updated ?? entry.date }));
    }
    (0, map_1.map)(root, data.url, urls);
    fs.write(path.join(root, 'feed.xml'), template.render(FEED, { ...data, entries }));
}
//# sourceMappingURL=feed.js.map