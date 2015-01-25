/// <reference path='../typings/tsd.d.ts' />

import Gistpod = require('../lib/gistpod')
import cli = require('cli-components')


var program = require('commander')
program.parse(process.argv)
if (program.args.length < 1) {
    cli.io.dieError('Missing argument: GitHub username')
}

var username = program.args.shift()

Gistpod.load()
       .then(gistpod => gistpod.setGithubUsername(username))
       .catch(err => cli.io.dieError(err))
       .done (x   => cli.io.print('GitHub username set.'))


