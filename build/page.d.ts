export interface Site {
    public: string;
    description: string;
    url: string;
    analytics: string;
    stylesheet: string;
    highlight?: boolean;
}
export interface Page {
    title: string;
    path: string;
    style?: string;
    id?: string;
    header?: string;
    content: string;
    script?: string;
}
export declare class Renderer {
    private readonly site;
    private readonly analytics;
    private stylesheet;
    constructor(options: Site);
    create(name: string, page: Page, replace?: (s: string) => string): void;
    render(page: Page, replace?: (s: string) => string): string;
    retain(file: string, now: Date): boolean;
    private static analytics;
}
