import * as djot from '@djot/djot';
import type { Visitor } from '@djot/djot/types/ast';
interface Options {
    assets?: string;
    save?: {
        title?: string;
        summary?: string;
    };
    transform?: (raw: string) => string;
    overrides?: Visitor<djot.HTMLRenderer, string>;
}
export declare function render(raw: string, options?: Options): string;
export {};
