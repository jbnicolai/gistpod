#!/usr/bin/env node

var async   = require('async')
  , Helpers = require('./helpers')
  , path    = require('path')
  , fs      = require('fs')


var PodfileUpdater = module.exports = {

    podfileWithUpdatedGistRefs: function (podfileFilename, podsToUpdate, callback) {
        Helpers.readGistPodspecCache(function (err, gists) {
            if (err) { return callback(err) }

            var gists = Helpers.mapGistPodspecArrayToObject(gists)

            fs.readFile(podfileFilename, function (err, data) {
                if (err) { return callback(err) }

                var podfile = data.toString()

                for (var i in podsToUpdate)
                {
                    var currentPod = podsToUpdate[i]
                    var url = gists[currentPod]

                    if (url != null && url != undefined) {
                        var currentPodspecURL = url.replace('githubusercontent.com', 'github.com')

                        var regex = RegExp('(pod\\s+[\'"]' + currentPod + '[\'"]\\s*,\\s*:podspec\\s*=>\\s*[\'"])([^\'"]*)([\'"])')
                        podfile = podfile.replace(regex, '$1' + currentPodspecURL + '$3')
                    }
                }

                callback(null, podfile)
            })
        })
    }

}





