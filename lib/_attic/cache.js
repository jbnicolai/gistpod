var fs = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    GitHub = require('./github'),
    Config = require('./config'),
    File = require('./file')


require('./string.endsWith')

module.exports = {
    getCacheFilename: getCacheFilename,
    // touchCache: touchCache,
    ensureCache: ensureCache,
    readGistCache: readGistCache,
    getRawURLForPodspec: getRawURLForPodspec,
    updateGistCacheFromAPI: updateGistCacheFromAPI,
}


function getCacheFilename () {
    return path.join(process.env.HOME, '.cache', 'gistpod')
}

function ensureCache (callback) {
    var filename = getCacheFilename()
    fs.ensureFile(filename, function (err) {
        if (err) { return callback(err) }

        File.ensureFileExistsWithMinimumContents(filename, '[]')
        return callback(null)
    })
}

function readGistCache (callback)
{
    getGistCacheAsJSONObject(function (err, cache) {
        if (err) { return callback(err) }

        if (cache.length <= 0)
        {
            Config.getUsername(function (err, username) {
                if (err) { return callback(err) }

                updateGistCacheFromAPI(username, function (err) {
                    if (err) { return callback(err) }

                    return getGistCacheAsJSONObject(callback)
                })
            })
        }
        else {
            return callback(null, cache)
        }
    })
}

function getGistCacheAsJSONObject (callback) {
    fs.readFile(getCacheFilename(), function (err, data) {
        try {
            var json  = data.toString()
            var gists = JSON.parse(json)

            return callback(null, gists)
        }
        catch (err) { return callback(err) }
    })
}

function writeGistPodspecEntriesToCache (entries, callback) {
    // for some reason, if the domain is the 'githubusercontent.com' (which is what's returned by the API), it causes CocoaPods to bail when you try to run `pod install`
    for (var i in entries) {
        entries[i]['raw_url'] = entries[i]['raw_url'].replace('githubusercontent.com', 'github.com')
    }

    var encodedJSON = JSON.stringify(entries)
    fs.writeFile(getCacheFilename(), encodedJSON, callback)
}

function reduceGistsToCacheEntries (relevantGists, nextGist, callback) {
    if (nextGist.files == null || nextGist.files == undefined) { return callback(null, relevantGists) }

    for (var f in nextGist.files) {
        if (!nextGist.files.hasOwnProperty(f)) { return callback(null, current) }

        var file = nextGist.files[f]
        if (file.filename.endsWith('.podspec')) {
            relevantGists.push(createCacheEntry(file))
        }
    }
    return callback(null, relevantGists)
}

function createCacheEntry (file) {
    return {
        'name':     file.filename.replace('.podspec', ''),
        'raw_url':  file.raw_url,
    }
}



function updateGistCacheFromAPI (username, callback)
{
    GitHub.getAllGistsFromAPI(username, function (err, gists) {
        if (err) { return callback(err) }

        async.reduce(gists, [], reduceGistsToCacheEntries, function (err, entries) {
            if (err) { return callback(err) }
            writeGistPodspecEntriesToCache(entries, callback)
        })
    })
}

function getRawURLForPodspec (podspec, callback)
{
    readGistCache(function (err, gists) {
        if (err) { return callback(err) }

        for (var i in gists)
        {
            var gist = gists[i]
            if (gist.name == podspec) {
                return callback(null, gist.raw_url)
            }
        }
        return callback('Podspec "' + podspec + '" not found in cache.')
    })
}



