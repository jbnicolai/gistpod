var fs = require('fs')

module.exports = {
    ensureFileExistsWithMinimumContents: ensureFileExistsWithMinimumContents,
}

function ensureFileExistsWithMinimumContents (filename, contents)
{
    if (!fs.existsSync(filename)) {
        fs.appendFileSync(filename, contents)
    }
    else {
        var file = fs.readFileSync(filename).toString()
        if (file.trim().length <= 0) {
            fs.writeFileSync(filename, contents)
        }
    }
}
