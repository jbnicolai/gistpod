#!/usr/bin/env node --harmony
var CommandRouter = require('command-router')
  , tasks = new CommandRouter()
  , path = require('path')
  , extend = require('extend')

var $ = require('cli-components')
$.buildTools.addToGlobalScope()

/**
    configuration
*/

var SOURCES             = ['lib/gistpod.ts']
var EXECUTABLE_SOURCES  = ['bin/gistpod.ts']
var SOURCE_ROOT         = 'src'
var BUILD_ROOT          = 'build'

var BUILD_OUTPUT_FILETYPES = /(\.d\.ts|\.js|\.js\.map)$/

var TSD_UMBRELLA_INCLUDE_PATH = './typings/tsd.d.ts'

var TS_COMPILER_CMD = 'tsc'

function TS_COMPILER_ARGS(args)
{
    return extend({
        module: 'commonjs'
      , target: 'ES6'
    }, args)
}


/**
    tasks
 */

tasks.command('',        function () { buildFiles(SOURCES) })
tasks.command('build',   function () { buildFiles(SOURCES) })
tasks.command('build *', function () { buildFiles(tasks.params.splats) })
tasks.command('clean',   function () {
    $.file.removeFileTypesFromDir(BUILD_OUTPUT_FILETYPES, BUILD_ROOT)
})

tasks.on('notfound', function (action) {
    $.io.dieError(new Error('Unknown command.'))
})


function buildFiles(buildFiles)
{
    rm('-rf', BUILD_ROOT)

    mkdir('-p', BUILD_ROOT + '/lib')
    mkdir('-p', BUILD_ROOT + '/bin')
    mkdir('-p', BUILD_ROOT + '/d.ts')

    tsc(SOURCE_ROOT, SOURCES,            BUILD_ROOT + '/lib', TS_COMPILER_ARGS({declaration: true}))
    tsc(SOURCE_ROOT, EXECUTABLE_SOURCES, BUILD_ROOT,          TS_COMPILER_ARGS({}))

    ls(BUILD_ROOT + '/lib/*.d.ts').forEach(function (file) {
        mv(file, BUILD_ROOT + '/d.ts')
    })

    ls('build/bin/*.js').forEach(function (filename) {
        chmod('+x', filename)
        $.file.prependStringToFile(filename, '#!/usr/bin/env node --harmony\n')
        mv(filename, filename.replace('.js', ''))
    })

    // cp('-fR', 'src/*.js', 'build/')
}




/**
    entry point
 */

logn()
tasks.parse(process.argv)
logn()

