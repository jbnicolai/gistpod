/// <reference path='../typings/tsd.d.ts' />
/// <reference path='../node_modules/cli-components/build/index.d.ts'/>

import cli = require('cli-components')
import when = require('when')

import GitHub = require('./github')
import PodfileUpdater = require('./podfile-updater')
import GistCacheEntry = require('./gist-cache-entry')

export = Gistpod

class Gistpod
{
    config   :cli.Config;
    cache    :cli.Cache;

    static load() :when.Promise<Gistpod>
    {
        var configPromise = cli.Config.load('gistpod')
        var cachePromise  = cli.Cache .load('gistpod')

        return when.join(configPromise, cachePromise)
                   .then(results => {
                        var config :cli.Config = results[0]
                        return Gistpod .ensureUsername(config)
                                       .then(config   => { return { config:config, cache:results[1] } })
                    })
                   .then(args => new Gistpod(args.config, args.cache))
    }

    static ensureUsername(config:cli.Config) :when.Promise<string>
    {
        return when.promise((resolve, reject) => {
            var username :string = config.fetch('username')
            if (username === null || username === undefined || username.length == 0) {
                // @@TODO: prompt user for input
            }
            else {
                return when.resolve(username)
            }
        })
        .then(username => config.store('username', username).save() )
    }

    constructor(_config:cli.Config, _cache:cli.Cache) {
        this.config = _config
        this.cache = _cache
    }


    get githubUsername() :string { return this.config.fetch('username') }

    setGithubUsername(newUsername:string) :when.Promise<void> {
        return this.config  .store('username', newUsername)
                            .save().then(x => { return })
    }

    updateGistCacheFromAPI() :when.Promise<void> {
        return GitHub.getAllGists(this.githubUsername)
                     .then(gists => this.cache.store('gists', gists).save())
                     .then(x => { return })
    }

    fetchPodInfo(pod:string) :GistCacheEntry {
        var gists :GistCacheEntry[] = this.cache.fetch('gists')
        for (var i in gists) {
            if (gists[i].name == pod) {
                return gists[i]
            }
        }
        return null
    }
}




