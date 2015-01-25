/// <reference path='../../typings/tsd.d.ts' />

import cli     = require('cli-components')
import Gistpod = require('../lib/gistpod')

var args = process.argv ; args.shift() ; args.shift()

var podfileDir   = (args.length > 0) ? args[0]       : '.'

Gistpod .load()
        .then(gistpod => gistpod.writePodfileFromTemplate(podfileDir))
        .catch(err   => cli.io.dieError(err))
        .done (()    => cli.io.println('Podfile updated.'))



