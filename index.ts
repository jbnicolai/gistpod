/// <xxx reference path='./node_modules/cli-components/cli-components.d.ts' />
/// <reference path='./typings/tsd.d.ts'/>
/// <xxx reference path='./lib/github.ts'/>


// declare function require(str) :{};

// import cli = require('cli-components')


import cli = require('./node_modules/cli-components/cli-components')
import Cache = cli.Cache

// cli.io.
import GitHub = require('./lib/github')
import PodfileUpdater = require('./lib/podfile-updater')


export class Gistpod
{
    cache:          Cache;
    io:             cli.io;
    config:         cli.Config;
    github:         GitHub;
    podfileUpdater: PodfileUpdater;
}




