/// <reference path='../../typings/tsd.d.ts' />

import buffer         = require('buffer')
import path           = require('path')
import fs             = require('fs-extra')
import os             = require('os')
import cli            = require('cli-components')
import when           = require('when')
import when_node      = require('when/node')
import GistCacheEntry = require('./gist-cache-entry')

import $ = cli

var fsp = when_node.liftAll(fs)

export = PodfileUpdateCommand

class PodfileUpdateCommand
{
    podfileDir: string;
    cache: $.Cache;

    constructor(_cache: $.Cache) {
        this.cache = _cache
    }

    writePodfileFromTemplate (podfileDir:string) :when.Promise<void>
    {
        return this.expandPodfileVariables(podfileDir)
                   .then(newContents => this.writePodfile(podfileDir, newContents))
    }

    writePodfile (podfileDir:string, podfileContents:string) :when.Promise<void> //PodfileUpdateCommand>
    {
        var podfilePath = path.join(podfileDir, 'Podfile')
        return this.backupPodfile(podfilePath)
                   .then(() => fsp.writeFile(podfilePath, podfileContents))
    }


    expandPodfileVariables (podfileDir:string) :when.Promise<string>
    {
        var PATHS = {
            'Podfile':          path.join(podfileDir, 'Podfile'),
            'Podfile.gistpod':  path.join(podfileDir, 'Podfile.gistpod'),
        }

        return fsp.readFile(PATHS['Podfile.gistpod'], 'utf8')
                  .then(buffer => buffer.toString())
                  .then((templateContents :string) => {
                      return templateContents.match(/#\{[a-zA-Z0-9_\-\+]+\}/g)
                                      .map(str => { var x = str.replace(/[#\{\}]/g, ''); console.log('match => ', x); return x })
                                      .reduce((pfcontents:string, foundpod:string) => {
                                            return this.expandVariable(pfcontents, foundpod)
                                        }, templateContents)
                  })
    }

    expandVariable (podfileContents:string, foundPod:string) :string
    {
        var gists :GistCacheEntry[] = this.cache.fetch('gists')
        if (gists == null || gists == undefined) { return podfileContents }

        var entry :GistCacheEntry = gists.filter(entry => entry.name == foundPod).shift() //[foundPod]

        if (entry != null && entry != undefined) {
            var currentPodspecURL = entry.raw_url.replace('githubusercontent.com', 'github.com')
            podfileContents = podfileContents.replace('#{' + foundPod + '}', "'" + currentPodspecURL + "'")
        }
        return podfileContents
    }

    backupPodfile (podfilePath) :when.Promise<string> {
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







