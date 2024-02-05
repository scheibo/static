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
export declare function render(root: string, data: Feed): void;
