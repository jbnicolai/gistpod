/// <reference path='../../typings/tsd.d.ts' />
var request = require('request');
var when = require('when');
function getAllGists(username) {
    var options = {
        headers: { 'User-Agent': 'gistpod' },
    };
    return when.promise(function (resolve, reject) {
        request("https://api.github.com/users/" + username + "/gists", options, function (error, response, body) {
            switch (response.statusCode) {
                case 200: return resolve(body);
                case 404:
                default: return reject(new Error('Error: GitHub API response status code was "' + response.statusCode + '".  Did you set your username correctly?'));
            }
        });
    }).then(function (body) { return when.attempt(JSON.parse, body); }).then(function (gistArray) { return gistArray; });
}
exports.getAllGists = getAllGists;
