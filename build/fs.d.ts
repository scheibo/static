/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'fs';
export declare const list: (dir: string) => string[];
export declare const mkdir: (dir: string) => string | undefined;
export declare const cpdir: (src: string, dst: string) => void;
export declare const remove: (file: string) => void;
export declare const exists: (file: string) => boolean;
export declare const stat: (file: string) => fs.Stats;
export declare const read: (file: string) => string;
export declare const write: (file: string, data: string | NodeJS.ArrayBufferView) => void;
export declare const copy: (src: string, dst: string) => void;
