/// <reference path='../../typings/tsd.d.ts' />
var GistCacheEntry = (function () {
    function GistCacheEntry(nom, url) {
        this.name = nom;
        this.raw_url = url;
    }
    return GistCacheEntry;
})();
module.exports = GistCacheEntry;
