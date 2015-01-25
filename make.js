#!/usr/bin/env node --harmony
var CommandRouter = require('command-router')
  , tasks = CommandRouter()

var $ = require('./build/index')
$.buildTools.addToGlobalScope()

/**
    configuration
*/

var SOURCES = ['src/lib/gistpod.ts', 'src/bin/*.ts'] //, 'src/io.ts', 'src/file.ts', 'src/config.ts', 'src/cache.ts', 'src/build-tools.ts']

var BUILD_OUTPUT_FILETYPES = /(\.d\.ts|\.js|\.js\.map)$/

var BUILD_OUTPUT_PATHS = ['./build']

var TSD_UMBRELLA_INCLUDE_PATH = './typings/tsd.d.ts'

var TS_COMPILER_CMD = 'tsc'

var TS_COMPILER_ARGS =  [   '--module commonjs'
                          , '--target ES6'
                          , '--declaration'
                          , '--outDir ./build' ]


/**
    tasks
 */

tasks.command('',        function () { buildFiles(SOURCES) })
tasks.command('build',   function () { buildFiles(SOURCES) })
tasks.command('build *', function () { buildFiles(tasks.params.splats) })
tasks.command('clean',   function () {
    BUILD_OUTPUT_PATHS.forEach(function (path) {
        $.file.removeFileTypesFromDir(BUILD_OUTPUT_FILETYPES, path)
    })
})
tasks.on('notfound', function (action) {
    console.error('Unknown command.')
    process.exit(1)
})


function buildFiles(buildFiles)
{
    mkdir('-p', './build')

    var cmd = [].concat(TS_COMPILER_CMD, TS_COMPILER_ARGS, buildFiles).join(' ')
    var result = exec(cmd)

    if (result.code !== 0) {
        process.exit(result.code)
    }

    cp('-f', 'src/*.js', 'build/')
}



/**
    entry point
 */

logn()
tasks.parse(process.argv)
logn()

