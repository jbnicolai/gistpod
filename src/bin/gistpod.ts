/// <reference path='../../typings/tsd.d.ts' />

import cli            = require('cli-components')
import chalk          = require('chalk')
import cliff          = require('cliff')
import CommandRouter  = require('command-router')

import Gistpod        = require('../lib/gistpod')
import GistCacheEntry = require('../lib/gist-cache-entry')

var r = new CommandRouter()

var args :string[] = [].concat(process.argv)
args.shift()
args.shift()

Gistpod.load().then((gistpod) => {

    r.command('update', () => {
        var podfileDir = (args.length > 0) ? args[0] : '.'
        gistpod.writePodfileFromTemplate(podfileDir)
               .catch(err   => cli.io.dieError(err))
               .done (()    => cli.io.println('Podfile updated.'))
    })

    r.command('pull', () => {
        gistpod.updateGistCacheFromAPI()
               .catch(err => cli.io.dieError(err))
               .done(() => cli.io.println('Gist podspecs updated.'))
    })

    r.command('list', () => {
        var gists = gistpod.fetchAllPodspecInfo()
        cli.io.println(formatGistList(gists))
    })

    r.command('username', () => {
        var username = args.shift()
        Gistpod.load()
               .then(gistpod => gistpod.setGithubUsername(username))
               .catch(err => cli.io.dieError(err))
               .done (x   => cli.io.println('GitHub username set.'))
   })

    r.command('url', () => {
        var podName = args.shift()
        Gistpod.load()
               .then (gistpod => gistpod.fetchPodspecInfo(podName))
               .then (podspec => cli.io.print(podspec.raw_url))
               .catch(err => cli.io.dieError(err))
    })

    // logn()
    r.parse(process.argv)
    // logn()
})



function formatGistList (gists:GistCacheEntry[]) :string
{
    var rows :any[] = [ [chalk.underline.bold('Pod'),  chalk.underline.bold('Podspec gist URL')], ]

    for (var i in gists) {
        var gist = gists[i]
        var row  = [chalk.blue(gist.name), gist.raw_url]
        rows.push(row)
    }
    return '\n' + cliff.stringifyRows(rows, ['cyan', 'green'])
}


