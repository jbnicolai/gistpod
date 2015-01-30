/// <reference path='../../typings/tsd.d.ts' />

import chalk = require('chalk')
import cliff = require('cliff')
import cli = require('cli-components')
import Gistpod = require('../lib/gistpod')
import GistCacheEntry = require('../lib/gist-cache-entry')


Gistpod .load()
        .then (gistpod => {
            var gists = gistpod.fetchAllPodspecInfo()
            cli.io.print(formatGistList(gists))
        })
        .catch(err => cli.io.dieError(err))




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