
var cliff = require('cliff')


module.exports = {
    print: print,
    dieError: dieError,
    formatGistList: formatGistList,
}


function print (output) {
    process.stdout.write(output + '\n')
}

function dieError (err) {
    process.stderr.write('Error: ' + err + '\n')
    throw err
    // process.exit(1)
}

function formatGistList (gists) {
    var rows = [ ['Pod'.underline.bold,  'Podspec gist URL'.underline.bold], ]

    for (var i in gists) {
        var gist = gists[i]
        var row  = [gist.name.blue, gist.raw_url]
        rows.push(row)
    }
    return '\n' + cliff.stringifyRows(rows, ['cyan', 'green'])
}




