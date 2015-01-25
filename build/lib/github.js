/// <reference path='../../typings/tsd.d.ts' />
var request = require('request');
var when = require('when');
function getAllGists(username) {
    var options = {
        headers: { 'User-Agent': 'gistpod' },
    };
    return when.promise(function (resolve, reject) {
        request("https://api.github.com/users/" + username + "/gists", options, function (error, response, body) {
            if (response.statusCode != 200) {
                return reject(new Error('Error: GitHub API response status code was "' + response.statusCode + '"'));
            }
            return resolve(body);
        });
    }).then(function (body) { return when.attempt(JSON.parse, body); }).then(function (gistArray) { return gistArray; }); //{
    //       var asdf :Gist[] = gistArray
    // })
    // when.attempt(JSON.parse, body)
    //     // .done(resolve, reject)
    //     .done(gistArray => resolve(<Gist[]>gistArray), reject)
    // try {
    //     var gists = <Gist[]>JSON.parse(body)
    //     return resolve(gists)
    // }
    // catch (error) { reject(error) }
    // })
    // })
}
exports.getAllGists = getAllGists;
