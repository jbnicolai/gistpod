/// <reference path='./typings/tsd.d.ts'/>

import cli = require('cli-components')

// import cli = require('../node_modules/cli-components/src/index.ts')
import GitHub = require('./lib/github')
import PodfileUpdater = require('./lib/podfile-updater')

export class Gistpod
{
    cache:          cli.Cache;
    io:             cli.IO;
    config:         cli.Config;
    github:         GitHub;
    podfileUpdater: PodfileUpdater;
}




