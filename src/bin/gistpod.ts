/// <reference path='../../typings/tsd.d.ts' />

import $              = require('cli-components')
import chalk          = require('chalk')
import cliff          = require('cliff')
import when           = require('when')
import CommandRouter  = require('command-router')

import Gistpod        = require('../lib/gistpod')
import GistCacheEntry = require('../lib/gist-cache-entry')

var r = new CommandRouter()
var args :string[] = [].concat(process.argv).slice(3)

Gistpod.load().then((gistpod) => {
    r.on('notfound', () => {
        $.io.println(r.helpText())
        process.exit(1)
    })

    r.command('update', '(Over)writes the Podfile in the current directory with a newly-generated one based on Podfile.gistpod.', () => {
        var podfileDir = (args.length > 0) ? args[0] : '.'
        return gistpod.writePodfileFromTemplate(podfileDir)
                      .then(() => 'Podfile updated.')
    })

    r.command('pull', 'Pulls your latest gist information from GitHub into your local cache.', () => {
        return gistpod.updateGistCacheFromAPI()
                      .then(() => 'Cache updated.')
    })

    r.command('list', 'Lists the podspecs found in your GitHub gist account.', () => {
        var gists = gistpod.fetchAllPodspecInfo()
        return when.resolve(formatGistList(gists))
    })

    r.command('username :username', 'Sets the GitHub username of the gists account you want to source podspecs from.', () => {
        return gistpod.setGithubUsername(r.params.username)
                      .then(() => 'Username set.')
    })

    r.command('url :podName', 'Prints the url of the gist containing the specified podspec.', () => {
        return when.resolve(gistpod.fetchPodspecInfo(r.params.podName))
                   .then((podspec) => podspec.raw_url)
    })

    r.parse(process.argv)
       .then (text => $.io.print(text))
       .catch(err  => $.io.dieError(err))
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


