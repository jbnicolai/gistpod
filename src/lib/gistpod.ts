/// <reference path='../../typings/tsd.d.ts' />

import cli = require('cli-components')
import when = require('when')
import path = require('path')
// import inquirer = require('inquirer')

import GitHub = require('./github')
import PodfileUpdater = require('./podfile-updater')
import GistCacheEntry = require('./gist-cache-entry')

export = Gistpod

class Gistpod
{
    config   :cli.Config;
    cache    :cli.Cache;
    podfileUpdater :PodfileUpdater;

    static load() :when.Promise<Gistpod>
    {
        var configPromise = cli.Config.load('gistpod')
        var cachePromise  = cli.Cache .load('gistpod')
        return when.join(configPromise, cachePromise)
                   .then(results => {
                        return Gistpod .ensureUsername(<cli.Config>results[0])
                                       .then(config   => { return { config:config, cache:<cli.Cache>results[1] } })
                    })
                   .then(args => new Gistpod(args.config, args.cache))
    }

    static ensureUsername(config:cli.Config) :when.Promise<cli.Config>
    {
        return when.promise((resolve, reject) => {
            var username :string = config.fetch('username')
            if (username === null || username === undefined || username.length == 0) {
                // @@TODO: prompt user for input
                username = 'brynbellomy'
                return resolve(username)
            }
            else {
                return resolve(username)
            }
        })
        .then(username => config.store('username', username).save() )
    }

    constructor(_config:cli.Config, _cache:cli.Cache) {
        this.config = _config
        this.cache = _cache
        this.podfileUpdater = new PodfileUpdater(this.cache)
    }


    get githubUsername() :string { return this.config.fetch('username') }

    setGithubUsername(newUsername:string) :when.Promise<void> {
        return this.config  .store('username', newUsername)
                            .save().then(x => { return })
    }

    updateGistCacheFromAPI() :when.Promise<void>
    {
        return GitHub   .getAllGists(this.githubUsername)
                        .then((gists:GitHub.Gist[]) => {
                            return gists.reduce((into: GistCacheEntry[], gist: GitHub.Gist) => {
                                for (var filename in gist.files) {
                                    if (path.extname(filename) == '.podspec') {
                                        var name = filename.replace('.podspec', '')
                                        var raw_url = gist.files[filename].raw_url.replace('githubusercontent.com', 'github.com')
                                        into.push(new GistCacheEntry(name, raw_url))
                                    }
                                }
                                return into
                            }, new Array<GistCacheEntry>())
                        })
                        .then(gists => this.cache.store('gists', gists).save())
                        .then(x => { return })
    }

    fetchPodspecInfo(pod:string) :GistCacheEntry {
        var gists :GistCacheEntry[] = this.cache.fetch('gists')
        for (var i in gists) {
            if (gists[i].name == pod) {
                return gists[i]
            }
        }
        return null
    }

    fetchAllPodspecInfo() :GistCacheEntry[] {
        return <GistCacheEntry[]>this.cache.fetch('gists')
    }

    writePodfileFromTemplate (podfileDir:string) :when.Promise<void> {
        return this.podfileUpdater.writePodfileFromTemplate(podfileDir)
    }

    backupPodfile (podfilePath) :when.Promise<string> {
        return this.podfileUpdater.backupPodfile(podfilePath)
    }
}




