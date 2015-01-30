/// <reference path='../../typings/tsd.d.ts' />

import Gistpod = require('../lib/gistpod')
import cli = require('cli-components')

var args = process.argv ; args.shift() ; args.shift()

if (args.length < 1) {
    cli.io.dieError('Not enough arguments!')
}

var podName = args.shift()

Gistpod.load()
       .then (gistpod => gistpod.fetchPodspecInfo(podName))
       .catch(err => cli.io.dieError(err))
       .done (podspec => cli.io.print(podspec.raw_url))



