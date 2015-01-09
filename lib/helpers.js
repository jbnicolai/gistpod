
var request = require('request')
  , async   = require('async')
  , path    = require('path')
  , fs      = require('fs')
  , cliff   = require('cliff')


var Helpers = module.exports = {
    CLI: {
        print:       function (output) { process.stdout.write(output) },
        dieError:    function (err)    {
            process.stderr.write('Error: ' + err + '\n')
            process.exit(1)
        },
    },

    getCacheFilename:  function () { return path.join(process.env.HOME, '.gistpod-cache') },
    getConfigFilename: function () { return path.join(process.env.HOME, '.gistpod') },

    touchConfig: function () {
        var filename = Helpers.getConfigFilename()

        if (!fs.existsSync(filename))
        {
            var config = { username: null }
            var json = JSON.stringify(config)
            fs.appendFileSync(filename, json)
        }
    },

    touchCache: function () {
        var filename = Helpers.getCacheFilename()
        if (!fs.existsSync(filename)) {
            fs.appendFileSync(filename, '[]')
        }
    },

    readConfig: function (callback) {
        fs.readFile(Helpers.getConfigFilename(), function (err, data) {
            if (err) { return callback(err) }

            try {
                var config = JSON.parse(data.toString())
                return callback(null, config)
            }
            catch (err) { return callback(err) }
        })
    },

    writeValueToConfig: function (key, value, callback) {
        Helpers.readConfig(function (err, config) {
            if (err) { return callback(err) }

            config[key] = value
            Helpers.writeConfig(config, callback)
        })
    },

    writeConfig: function (config, callback) {
        try {
            var json = JSON.stringify(config)
            fs.writeFile(Helpers.getConfigFilename(), json, callback)
        }
        catch (err) { return callback(err) }
    },

    formatGistList: function (gists) {
        var rows = [ ['Pod'.underline.bold,  'Podspec gist URL'.underline.bold], ]

        for (var i in gists) {
            var gist = gists[i]
            var row  = [gist.name.blue, gist.raw_url]
            rows.push(row)
        }
        return '\n' + cliff.stringifyRows(rows, ['cyan', 'green'])
    },

    readGistPodspecCache: function (callback) {
        fs.readFile(Helpers.getCacheFilename(), function (err, data) {
            try {
                var json  = data.toString()
                var gists = JSON.parse(json)
                if (gists.length <= 0) {
                    return callback('Podspec cache is empty.  Try calling "gistpod update" to refresh the cache from the GitHub API.')
                }

                return callback(null, gists)
            }
            catch (err) { return callback(err) }
        })
    },

    mapGistPodspecArrayToObject: function (entries) {
        var obj = {}
        for (var i in entries) {
            var entry = entries[i]
            obj[entry.name] = entry.raw_url
        }
        return obj
    },

    getAllGistsFromAPI: function (username, callback) {
        var options = {
            url: "https://api.github.com/users/" + username + "/gists",
            headers: { 'User-Agent': 'gistpod' },
        }

        request(options, function (error, response, body) {
            if (error) { return callback(error) }
            if (response.statusCode != 200) { return callback('unknown error: response.statusCode == "' + response.statusCode + '"') }

            try {
                var gists = JSON.parse(body)
                return callback(null, gists)
            }
            catch (error) { return callback(error) }
        })

    },

    writeGistPodspecEntriesToCache: function (entries, callback) {
        var encodedJSON = JSON.stringify(entries)
        fs.writeFile(Helpers.getCacheFilename(), encodedJSON, callback)
    },

    rejectGistsWithNoFiles: function (gist, callback) {
        callback(gist.files != null && gist.files != undefined)
    },

    reduceGistsToEntries: function (relevantGists, nextGist, callback) {
        if (nextGist.files == null || nextGist.files == undefined) { return callback(null, relevantGists) }

        for (var f in nextGist.files) {
            if (!nextGist.files.hasOwnProperty(f)) { return callback(null, current) }

            var file = nextGist.files[f]
            if (file.filename.endsWith('.podspec')) {
                var entry = Helpers.makeEntry(file)
                relevantGists.push(entry)
            }
        }
        return callback(null, relevantGists)
    },

    makeEntry: function (file) {
        return {
            'name':     file.filename.replace('.podspec', ''),
            'raw_url':  file.raw_url,
        }
    },
}
