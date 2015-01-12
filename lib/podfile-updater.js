#!/usr/bin/env node

var async   = require('async')
  , Helpers = require('./helpers')
  , path    = require('path')
  , fs      = require('fs-extra')


var PodfileUpdater = module.exports = {

    findAllGistpodRefs: function (podfile) {
        var matches = podfile.match(/#\{[a-zA-Z0-9_\-\+]+\}/g)
        return matches.map(function (str) {
            return str.replace(/[#\{\}]/g, '')
        })
    },

    getBackupDir: function () {
        return path.join(process.env['HOME'], '.gistpod-backup')
    },

    tryBackupPodfile: function (podfilePath, callback)
    {
        var backupDir = PodfileUpdater.getBackupDir()

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
    },

    writePodfile: function (podfileDir, podfileContents, callback) {
        var podfilePath = path.join(podfileDir, 'Podfile')
        PodfileUpdater.tryBackupPodfile(podfilePath, function (err, backupFilename) {
            if (err) { return callback(err) }
            if (backupFilename != null && backupFilename != undefined) {
                Helpers.CLI.print('Backup created: ' + backupFilename)
            }

            fs.writeFile(podfilePath, podfileContents, function (err) {
                if (err) { return callback(err) }
                return callback(null, 'Podfile updated.')
            })
        })
    },

    podfileBySubstitutingGistpodRefs: function (podfileDir, podsToUpdate, callback) {
        Helpers.readGistPodspecCache(function (err, gists) {
            if (err) { return callback(err) }

            var gists = Helpers.mapGistPodspecArrayToObject(gists)

            var filenames = {
                'Podfile':          path.join(podfileDir, 'Podfile'),
                'Podfile.gistpod':  path.join(podfileDir, 'Podfile.gistpod'),
            }

            fs.readFile(filenames['Podfile.gistpod'], function (err, data) {
                if (err) { return callback(err) }

                var podfile = data.toString()
                if (podsToUpdate.length <= 0) {
                    podsToUpdate = PodfileUpdater.findAllGistpodRefs(podfile)
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

}





