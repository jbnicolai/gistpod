/// <reference path='../typings/tsd.d.ts'/>
/// <reference path='../node_modules/cli-components/build/index.d.ts'/>

import Gistpod = require('../lib/gistpod')
import cli = require('cli-components')

cli.yargs

var program = require('commander')
program.parse(process.argv)


if (program.args.length < 1) {
    cli.io.dieError('Not enough arguments!')
}

var podName = program.args.shift()

Gistpod.load()
       .then(gistpod => gistpod.fetchPodInfo(podName))
       .catch(err => cli.io.dieError(err))
       .done (url => cli.io.print(url))



