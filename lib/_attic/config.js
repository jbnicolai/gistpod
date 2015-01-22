var fs = require('fs-extra'),
    path = require('path'),
    File = require('./file')

module.exports = {
     getConfigFilename: getConfigFilename,
     ensureConfig: ensureConfig,
     getUsername: getUsername,
     readValueFromConfig: readValueFromConfig,
     writeValueToConfig: writeValueToConfig,
     readConfig: readConfig,
}


function getConfigFilename () {
    return path.join(process.env.HOME, 'config', 'gistpod')
}

// function touchConfig () {
//     var configFile = getConfigFilename()
//     var configDir  = path.dirname(getConfigFilename)
//     fs.mkdirpSync(configDir)
//     File.ensureFileExistsWithMinimumContents(configFile, '{"username": null}')
// }

function ensureConfig(callback) {
    var filename = getConfigFilename()
    fs.ensureFile(filename, function (err) {
        if (err) { return callback(err) }

        File.ensureFileExistsWithMinimumContents(filename, '{"username": null}')
        return callback(null)
    })
}


function getUsername(callback) {
    readValueFromConfig ('username', function (err, username) {
        if (err) { return callback(err) }
        if (username == null || username == undefined || username.trim().length <= 0) {
            return callback('You haven\'t set your GitHub username yet.  Use the command: "gistpod username <your GitHub username>"')
        }
        else {
            return callback(null, username)
        }
    })
}


function readConfig (callback) {
    fs.readFile(getConfigFilename(), function (err, data) {
        if (err) { return callback(err) }

        try {
            var config = JSON.parse(data.toString())
            return callback(null, config)
        }
        catch (err) { return callback(err) }
    })
}

function writeValueToConfig (key, value, callback) {
    readConfig(function (err, config) {
        if (err) { return callback(err) }

        config[key] = value
        writeConfig(config, callback)
    })
}

function readValueFromConfig (key, callback) {
    readConfig(function (err, config) {
        if (err) { return callback(err) }
        callback(null, config[key])
    })
}

function writeConfig (config, callback) {
    try {
        var json = JSON.stringify(config)
        fs.writeFile(getConfigFilename(), json, callback)
    }
    catch (err) { return callback(err) }
}




