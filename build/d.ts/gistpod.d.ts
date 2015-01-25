/// <reference path="../../typings/tsd.d.ts" />
import cli = require('cli-components');
import when = require('when');
import PodfileUpdater = require('./podfile-updater');
import GistCacheEntry = require('./gist-cache-entry');
export = Gistpod;
declare class Gistpod {
    config: cli.Config;
    cache: cli.Cache;
    podfileUpdater: PodfileUpdater;
    static load(): when.Promise<Gistpod>;
    static ensureUsername(config: cli.Config): when.Promise<cli.Config>;
    constructor(_config: cli.Config, _cache: cli.Cache);
    githubUsername: string;
    setGithubUsername(newUsername: string): when.Promise<void>;
    updateGistCacheFromAPI(): when.Promise<void>;
    fetchPodspecInfo(pod: string): GistCacheEntry;
    fetchAllPodspecInfo(): GistCacheEntry[];
    writePodfileFromTemplate(podfileDir: string): when.Promise<void>;
    backupPodfile(podfilePath: any): when.Promise<string>;
}
