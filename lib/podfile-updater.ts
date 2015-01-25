/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../node_modules/cli-components/build/index.d.ts'/>

import path           = require('path')
import fs             = require('fs-extra')
import os             = require('os')
import cli            = require('cli-components')
import when           = require('when')
import when_node      = require('when/node')
import GistCacheEntry = require('./gist-cache-entry')

import $ = cli

var fsp = when_node.liftAll(fs)

export = PodfileUpdater

class PodfileUpdateCommand
{
    podfileDir: string;
    cache: $.Cache

    constructor(_cache: $.Cache, podfileDir:string) {
        this.cache = _cache
    }

    writePodfile (podfileDir:string, podfileContents:string) :when.Promise<PodfileUpdater>
    {
        var podfilePath = path.join(podfileDir, 'Podfile')
        return this.backupPodfile(podfilePath)
                   .then(() => { fsp.writeFile(podfilePath, podfileContents) ; return this })
    }


    expandPodfileVariables (podfileDir:string) :when.Promise<string>
    {
        var filenames = {
            'Podfile':          path.join(podfileDir, 'Podfile'),
            'Podfile.gistpod':  path.join(podfileDir, 'Podfile.gistpod'),
        }

        return fsp.readFile(filenames['Podfile.gistpod'], 'utf8')
                  .then(podfileContents => {
                      var regex = /#\{[a-zA-Z0-9_\-\+]+\}/g

                      return    $.file.findMatchesIn(podfileContents, regex)
                                      .map(str => str.replace(/[#\{\}]/g, ''))
                                      .reduce(this.expandVariable, podfileContents)
                  })
    }

    expandVariable (podfileContents:string, foundPod:string) :string
    {
        var url = this.cache.fetch(foundPod)
        if (url != null && url != undefined) {
            var currentPodspecURL = url.replace('githubusercontent.com', 'github.com')
            podfileContents = podfileContents.replace('#{' + foundPod + '}', "'" + currentPodspecURL + "'")
        }
        return podfileContents
    }


    // findAllVariablesInPodfile (podfile:string) :string[]
    // {
    //     var matches = podfile.match(/#\{[a-zA-Z0-9_\-\+]+\}/g)
    //     return (matches != null && matches != undefined)
    //                     ? matches.map(str => str.replace(/[#\{\}]/g, ''))
    //                     : []
    // }

    backupPodfile (podfilePath) :when.Promise<string>
    {
        var backupDir = $.file.tmpdir()
        return $.file.createBackup(podfilePath, backupDir)
    }
}





function mapGistPodspecArrayToObject (entries:GistCacheEntry[]) {
    var obj = {}
    for (var i in entries) {
        var entry = entries[i]
        obj[entry.name] = entry.raw_url
    }
    return obj
}






