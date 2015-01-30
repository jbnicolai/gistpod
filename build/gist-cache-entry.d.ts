/// <reference path="../typings/tsd.d.ts" />
export = GistCacheEntry;
declare class GistCacheEntry {
    name: string;
    raw_url: string;
    constructor(nom: string, url: string);
}
