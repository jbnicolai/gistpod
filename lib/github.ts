/// <reference path='../typings/tsd.d.ts' />

import request   = require('request')
import when      = require('when')
import when_node = require('when/node')
import http      = require('http')


export function getAllGists (username:string) :when.Promise<{}>
{
    var options = {
        headers: { 'User-Agent': 'gistpod' },
        // url: "https://api.github.com/users/" + username + "/gists",
    }

    return when.promise((resolve, reject) => {
        request.request("https://api.github.com/users/" + username + "/gists", options, (error:any, response:any, body:string) => {
            if (response.statusCode != 200) { return when.reject(new Error('Error: GitHub API response status code was "' + response.statusCode + '"')) }

            try {
                var gists = JSON.parse(body)
                return resolve(gists)
            }
            catch (error) { reject(error) }
        })
    })
}

