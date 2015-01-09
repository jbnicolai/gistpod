
require('./string.endsWith')

var async   = require('async')
  , Helpers = require('./helpers')
  , PodfileUpdater = require('./podfile-updater')


exports.Helpers = Helpers
exports.PodfileUpdater = PodfileUpdater


exports.writeValueToConfig = function (key, value, callback) {
    Helpers.writeValueToConfig(key, value, callback)
}


exports.updateGistPodspecURLCache = function (username, callback)
{
    Helpers.getAllGistsFromAPI(username, function (err, gists) {
        if (err) { return callback(err) }

        async.reduce(gists, [], Helpers.reduceGistsToEntries, function (err, entries) {
            if (err) { return callback(err) }
            Helpers.writeGistPodspecEntriesToCache(entries, callback)
        })
    })
}

exports.getRawURLForPodspec = function (podspec, callback)
{
    Helpers.readGistPodspecCache(function (err, gists) {
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

exports.getAllCachedPodspecGists = function (callback)
{
    Helpers.readGistPodspecCache(function (err, gists) {
        if (err) { return callback(err) }
        return callback(null, gists)
    })

}



