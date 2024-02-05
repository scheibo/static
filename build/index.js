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
exports.serve = exports.page = exports.map = exports.html = exports.fs = exports.feed = void 0;
exports.feed = __importStar(require("./feed"));
exports.fs = __importStar(require("./fs"));
exports.html = __importStar(require("./html"));
var map_1 = require("./map");
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return map_1.map; } });
exports.page = __importStar(require("./page"));
var server_1 = require("./server");
Object.defineProperty(exports, "serve", { enumerable: true, get: function () { return server_1.serve; } });
//# sourceMappingURL=index.js.map