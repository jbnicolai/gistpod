/// <reference path='./lib/build-tools.ts'/>
// #!/usr/bin/env node

require('shelljs/global')
// import shell = require('shelljs')
import chalk = require('chalk')
import path  = require('path')

mkdir('-p', 'build')

ls('src/*.md').forEach(function (file) {
    if (needsBuild(file, builtProductFor(file))) {
        print('Building ' + chalk.blue(file) + '... ')

        rm('-rf', builtProductFor(file))
        cd('build')
        var relativeFilepath = path.resolve('.', path.join('..', file))
        var result = exec('md2dash ' + relativeFilepath)
        print(formatResult(result) + '\n')
        cd('..')
    }
    else {
        print('Skipping ' + chalk.green(file) + ', already up-to-date.\n')
    }
})

ls('src/*.yaml').forEach(function (file) {
    if (needsBuild(file, builtProductFor(file))) {
        print('Building ' + chalk.blue(file) + '... ')

        rm('-rf', builtProductFor(file))
        var result = docs.generateFromYAML(file, 'src', 'build')
        print(formatResult(result) + '\n')
    }
    else {
        print('Skipping ' + chalk.green(file) + ', already up-to-date.\n')
    }
})


function print(msg) {
    process.stderr.write(msg)
}




