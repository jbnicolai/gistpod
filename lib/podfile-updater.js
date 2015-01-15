#!/usr/bin/env node

var CLI  = require('./cli')
  , path = require('path')
  , fs   = require('fs-extra')
  , Cache = require('./cache')


module.exports = {
    podfileBySubstitutingGistpodRefs: podfileBySubstitutingGistpodRefs,
    writePodfile: writePodfile,
}

function findAllGistpodRefsInPodfile (podfile) {
    var matches = podfile.match(/#\{[a-zA-Z0-9_\-\+]+\}/g)
    if (matches != null && matches != undefined) {
        return matches.map(function (str) {
            return str.replace(/[#\{\}]/g, '')
        })
    }
    else {
        return []
    }
}

function getBackupDir () {
    return '/tmp' // path.join(process.env['HOME'], '.gistpod-backup')
}

function tryBackupPodfile (podfilePath, callback)
{
    var backupDir = getBackupDir()

    var dateStr = new Date().toString()
    dateStr = dateStr.replace(/[^a-zA-Z0-9]/g, '-')

    var absPodfilePath  = path.resolve(podfilePath)
    var podfileDirParts = path.dirname(absPodfilePath).split('/')
    var podfileDir      = podfileDirParts[podfileDirParts.length - 1]
    var backupFilename  = path.join(backupDir, 'Podfile.' + podfileDir + '.' + dateStr).replace(/\-+$/, '')

    fs.ensureDir(backupDir, function (err) {
        if (err) { return callback(err) }
        if (fs.existsSync(podfilePath))
        {
            fs.copy(podfilePath, backupFilename, function (err) {
                if (err) { return callback(err) }
                return callback(null, backupFilename)
            })
        }
        else {
            return callback(null, null)
        }
    })
}

function writePodfile (podfileDir, podfileContents, callback) {
    var podfilePath = path.join(podfileDir, 'Podfile')
    tryBackupPodfile(podfilePath, function (err, backupFilename) {
        if (err) { return callback(err) }
        if (backupFilename != null && backupFilename != undefined) {
            CLI.print('Backup created: ' + backupFilename)
        }

        fs.writeFile(podfilePath, podfileContents, function (err) {
            if (err) { return callback(err) }
            return callback(null, 'Podfile updated.')
        })
    })
}


function mapGistPodspecArrayToObject (entries) {
    var obj = {}
    for (var i in entries) {
        var entry = entries[i]
        obj[entry.name] = entry.raw_url
    }
    return obj
}

function podfileBySubstitutingGistpodRefs (podfileDir, podsToUpdate, callback) {
    Cache.readGistCache(function (err, gists) {
        if (err) { return callback(err) }

        var gists = mapGistPodspecArrayToObject(gists)

        var filenames = {
            'Podfile':          path.join(podfileDir, 'Podfile'),
            'Podfile.gistpod':  path.join(podfileDir, 'Podfile.gistpod'),
        }

        fs.readFile(filenames['Podfile.gistpod'], function (err, data) {
            if (err) { return callback(err) }

            var podfile = data.toString()
            if (podsToUpdate.length <= 0) {
                podsToUpdate = findAllGistpodRefsInPodfile(podfile)
            }

            for (var i in podsToUpdate)
            {
                var currentPod = podsToUpdate[i]
                var url = gists[currentPod]

                if (url != null && url != undefined) {
                    var currentPodspecURL = url.replace('githubusercontent.com', 'github.com')
                    podfile = podfile.replace('#{' + currentPod + '}', "'" + currentPodspecURL + "'")
                }
            }

            callback(null, podfile)
        })
    })
}






