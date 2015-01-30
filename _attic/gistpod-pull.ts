/// <reference path='../../typings/tsd.d.ts' />

import Gistpod = require('../lib/gistpod')
import cli = require('cli-components')


Gistpod.load()
        .then(gistpod => gistpod.updateGistCacheFromAPI())
        .catch(err => cli.io.dieError(err))
        .done(() => cli.io.print('Gist podspecs updated.'))

