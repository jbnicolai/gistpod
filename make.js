#!/usr/bin/env node --harmony
var CommandRouter = require('command-router')
  , tasks = new CommandRouter()
  , path = require('path')
  , extend = require('extend')

var $ = require('cli-components')
$.build.addToGlobalScope()

/**
    configuration
*/

var SOURCES             = ['lib/gistpod.ts']
var EXECUTABLE_SOURCES  = ['bin/gistpod.ts']
var SOURCE_ROOT         = 'src'
var BUILD_ROOT          = 'build'

var BUILD_OUTPUT_FILETYPES = ['.js', '.js.map', '.d.ts']

var TSD_UMBRELLA_INCLUDE_PATH = './typings/tsd.d.ts'

function TS_COMPILER_ARGS(args) {
    return extend({ module: 'commonjs' , target: 'ES6' }, args)
}


/**
    tasks
 */

tasks.command('',                                                           function () { $.io.println(tasks.helpText()) })
tasks.command('build',   'Builds the project.',                             function () { buildFiles(SOURCES) })
tasks.command('build *', 'Builds specific file[s] from the project.',       function () { buildFiles(tasks.params.splats) })
tasks.command('clean',   'Removes built products from the build folder.',   function () { $.file.removeFileTypesFromDir(BUILD_OUTPUT_FILETYPES, BUILD_ROOT) })

tasks.on('notfound', function (action) { $.io.println(tasks.helpText()) })


function buildFiles(buildFiles)
{
    rm('-rf', BUILD_ROOT)

    mkdir('-p', BUILD_ROOT + '/lib')
    mkdir('-p', BUILD_ROOT + '/bin')
    mkdir('-p', BUILD_ROOT + '/d.ts')

    $.build.compileTypescript(SOURCE_ROOT, SOURCES,            BUILD_ROOT, TS_COMPILER_ARGS({declaration: true}))
    $.build.compileTypescript(SOURCE_ROOT, EXECUTABLE_SOURCES, BUILD_ROOT,          TS_COMPILER_ARGS({}))

    ls(BUILD_ROOT + '/lib/*.d.ts').forEach(function (file) {
        mv(file, BUILD_ROOT + '/d.ts')
    })

    ls('build/bin/*.js').forEach(function (filename) {
        chmod('+x', filename)
        $.file.prependStringToFile(filename, '#!/usr/bin/env node --harmony\n')
        mv(filename, filename.replace('.js', ''))
    })
}




/**
    entry point
 */

$.io.println()
tasks.parse(process.argv)
$.io.println()

