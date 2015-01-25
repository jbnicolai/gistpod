/// <reference path='../typings/tsd.d.ts' />

export = GistCacheEntry

class GistCacheEntry
{
    name    :string
    raw_url :string

    constructor(nom:string, url:string) {
        this.name = nom
        this.raw_url = url
    }
}
