/// <reference path='../../typings/tsd.d.ts' />
var cli = require('cli-components');
var when = require('when');
var path = require('path');
var inquirer = require('inquirer');
var GitHub = require('./github');
var PodfileUpdater = require('./podfile-updater');
var GistCacheEntry = require('./gist-cache-entry');
var Gistpod = (function () {
    function Gistpod(_config, _cache) {
        this.config = _config;
        this.cache = _cache;
        this.podfileUpdater = new PodfileUpdater(this.cache);
    }
    Gistpod.load = function () {
        var configPromise = cli.Config.load('gistpod');
        var cachePromise = cli.Cache.load('gistpod');
        return when.join(configPromise, cachePromise).then(function (results) {
            return Gistpod.ensureUsername(results[0]).then(function (config) {
                return { config: config, cache: results[1] };
            });
        }).then(function (args) { return new Gistpod(args.config, args.cache); });
    };
    Gistpod.ensureUsername = function (config) {
        return when.promise(function (resolve, reject) {
            var username = config.fetch('username');
            if (username === null || username === undefined || username.length == 0) {
                var questions = [{ type: "input", name: "username", message: "Enter your GitHub username:", }];
                inquirer.prompt(questions, function (answers) {
                    resolve(answers.username);
                    return;
                });
            }
            else {
                return resolve(username);
            }
        }).then(function (username) { return config.store('username', username).save(); });
    };
    Object.defineProperty(Gistpod.prototype, "githubUsername", {
        get: function () {
            return this.config.fetch('username');
        },
        enumerable: true,
        configurable: true
    });
    Gistpod.prototype.setGithubUsername = function (newUsername) {
        return this.config.store('username', newUsername).save().then(function (x) {
            return;
        });
    };
    Gistpod.prototype.updateGistCacheFromAPI = function () {
        var _this = this;
        return GitHub.getAllGists(this.githubUsername).then(function (gists) {
            return gists.reduce(function (into, gist) {
                for (var filename in gist.files) {
                    if (path.extname(filename) == '.podspec') {
                        var name = filename.replace('.podspec', '');
                        var raw_url = gist.files[filename].raw_url.replace('githubusercontent.com', 'github.com');
                        into.push(new GistCacheEntry(name, raw_url));
                    }
                }
                return into;
            }, new Array());
        }).then(function (gists) { return _this.cache.store('gists', gists).save(); }).then(function (x) {
            return;
        });
    };
    Gistpod.prototype.fetchPodspecInfo = function (pod) {
        var gists = this.cache.fetch('gists');
        for (var i in gists) {
            if (gists[i].name == pod) {
                return gists[i];
            }
        }
        return null;
    };
    Gistpod.prototype.fetchAllPodspecInfo = function () {
        return this.cache.fetch('gists');
    };
    Gistpod.prototype.writePodfileFromTemplate = function (podfileDir) {
        return this.podfileUpdater.writePodfileFromTemplate(podfileDir);
    };
    Gistpod.prototype.backupPodfile = function (podfilePath) {
        return this.podfileUpdater.backupPodfile(podfilePath);
    };
    return Gistpod;
})();
module.exports = Gistpod;
