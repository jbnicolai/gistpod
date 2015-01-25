/// <reference path='../typings/tsd.d.ts'/>

import chalk = require('chalk')
import cliff = require('cliff')
import cli = require('cli-components')
import Gistpod = require('../')

function formatGistList (gists)
{
    var rows = [ [chalk.underline.bold('Pod'),  chalk.underline.bold('Podspec gist URL')], ]

    for (var i in gists) {
        var gist = gists[i]
        var row  = [gist.name.blue, gist.raw_url]
        rows.push(row)
    }
    return '\n' + cliff.stringifyRows(rows, ['cyan', 'green'])
}

Gistpod.load()
         .catch(err => cli.io.dieError(err))
         .done (cache => {
             var gists = cache.fetch('gists')
             cli.io.print(formatGistList(gists))
          })

