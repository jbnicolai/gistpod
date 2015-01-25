/// <reference path='../typings/tsd.d.ts'/>
/// <reference path='../node_modules/cli-components/build/index.d.ts'/>

import cli     = require('cli-components')
import Gistpod = require('../lib/gistpod')

var program = require('commander')
program.parse(process.argv)


var podfileDir   = (program.args.length > 0) ? program.args[0]       : '.'
var podsToUpdate = (program.args.length > 1) ? program.args.slice(1) : []

Gistpod.podfileBySubstitutingGistpodRefs(podfileDir, podsToUpdate)
              .then(podfileContents => PodfileUpdater.writePodfile(podfileDir, podfile))
              .catch(err => cli.io.dieError(err))
              .then(() => cli.io.println('Podfile updated.'))




