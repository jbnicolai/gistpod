/// <reference path='../typings/tsd.d.ts' />
import Gistpod = require('./gistpod')
import cli = require('cli-components')


Gistpod.load()
        .then(gistpod => gistpod.updateGistCacheFromAPI())
        .catch(err => cli.io.dieError(err))
        .done(() => cli.io.print('Gist podspecs updated.'))

//         .then(config   => config.fetch('username'))
//             .then(username => {
//                 if (username == null || username == undefined) {
//                     return when.reject(new Error('You have to set your GitHub username with the command: "gistpod username <username>".'))
//                 }

//                 Gistpod.updateGistCacheFromAPI(username, function (err) {
//                     if (err) { cli.io.dieError(err) }
//                     else     { cli.io.print('Gist podspecs updated.') }
//                 })
//             })
//             .catch(err => cli.io.dieError(err))
//             .done(() => cli.io.print('Gist podspecs updated.'))
// })


