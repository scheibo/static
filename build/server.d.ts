import polka from 'polka';
export interface Directories {
    root: string;
    public?: string;
    static?: string;
    out?: string;
}
export declare function serve(port: number, root: string | Directories, fn?: (app: polka.Polka) => void): void;
