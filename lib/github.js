var request = require('request')


module.exports = {
    getAllGistsFromAPI: getAllGistsFromAPI,
}


function getAllGistsFromAPI (username, callback) {
    var options = {
        url: "https://api.github.com/users/" + username + "/gists",
        headers: { 'User-Agent': 'gistpod' },
    }

    request(options, function (error, response, body) {
        if (error) { return callback(error) }
        if (response.statusCode != 200) { return callback('unknown error: response.statusCode == "' + response.statusCode + '"') }

        try {
            var gists = JSON.parse(body)
            return callback(null, gists)
        }
        catch (error) { return callback(error) }
    })
}

