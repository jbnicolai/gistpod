#!/usr/bin/env node

var sh   = require('shelljs')
var fs   = require('fs')
  , path = require('path')
  , chalk = require('chalk')

var ls = sh.ls
  , cat = sh.cat
  , grep = sh.grep
  , echo = sh.echo

log.folderDepth = 0
log.tab = '    '

var TSD_UMBRELLA_INCLUDE_PATH = './typings/tsd.d.ts'

var TS_COMPILER_ARGS = [
    "--module commonjs",
    "--target ES6",
    "--outDir .",
    "--declaration",
    // "--removeComments",
    "--sourceMap",
    "--sourceRoot ./",
    // "--out index.js",
]

String.prototype.pipeTo = function (file) {
    log('Writing ' + chalk.bold(file) + '...')
    this.to(file)
}

processArgs()

function processArgs()
{
    var argv = process.argv
    argv.shift() // "node"
    argv.shift() // "make.js"

    if (argv.length > 0) {
        arg = argv.shift()
        switch (arg) {
            case 'build':   build(argv)         ; break
            case 'clean':   clean(argv)         ; break
            case 'tscargs': updateTSCArgsFile(argv) ; break
            case 'concat':  echo(cat(argv))     ; break
            case 'link':    linkAllLocalTSDs()  ; break
            case 'unlink':  unlinkAllLocalTSDs() ; break
            default:        log('Unknown command.'); process.exit(1)
        }
    }
    else { build(argv) }
}


function updateTSCArgsFile(argv)
{
    // var result = exec("find ./src -name '*.ts' | grep -v '.d.ts' | grep -v '_attic'")
    var result = exec("find ./lib -name '*.ts' | grep -v '_attic'")

    if (result.code !== 0) {
        log(chalk.red('Error: ' + result.output))
        process.exit(result.code)
    }

    var newArgs = [].concat(TS_COMPILER_ARGS, 'index.ts') //, result.output.split('\n'))
    newArgs.join('\n').pipeTo('./tscargs')
    // fs.writeFileSync('./tscargs', newContents)

    log(chalk.green('./tscargs') + ' updated.')
}


function build(argv)
{

    var cmdArgs = [].concat(TS_COMPILER_ARGS, 'index.ts')
    var cmd     = cmdArgs.join(' ')

    var result = exec('tsc ' + cmd)
    if (result.code !== 0) { process.exit(result.code) }

    // mkdir('-p', './lib')
    // ls('./build/lib/*.*').forEach(function (file) { mv('-f', file, './lib/') })
    // ls('./build/index.*').forEach(function (file) { mv('-f', file, './') })
    // rm('-rf', './build')

    // var builtJSFiles = ls('./index.js', './lib/*.js')
    // var concatenated = cat(builtJSFiles)
    // concatenated.split('\n').filter(removeReferencePathLines).join('\n').pipeTo('./index.js')

    // ls('./index.d.ts', './lib/*.d.ts').forEach(function (dtsFile) {
    //     log('Removing reference paths from ' + dtsFile + '...')
    //     var contents = cat(dtsFile).split('\n').filter(removeReferencePathLines).join('\n').pipeTo(dtsFile)
    // })
    // var builtDTSFiles = ls('index.d.ts', './lib/*.d.ts')
    // var concatenated  = cat(builtDTSFiles)
    // concatenated.split('\n').filter(removeReferencePathLines).join('\n').pipeTo('./cli-components.d.ts')
}

function clean(argv)
{
    // rm('-rf', './build')
    var buildProductsPaths = ['./src', './src/lib', './lib', '.']
    buildProductsPaths.forEach(removeGeneratedBuildProducts)
}


function linkAllLocalTSDs(argv) {
    linkLocalTSD('cli-components', '../cli-components')
}

function unlinkAllLocalTSDs(argv) {
    unlinkLocalTSD('cli-components')
}

function linkLocalTSD(moduleName, modulePath) {
    mkdir('-p', './typings/' + moduleName)

    var linkFile = moduleName + '.d.ts'
    var tsdFile  = path.resolve(path.join(modulePath, 'index.d.ts'))

    var tsdUmbrellaInclude = cat(TSD_UMBRELLA_INCLUDE_PATH)

    // append a reference to this module to tsd.d.ts if one doesn't exist
    if (regexForReferenceToModule(moduleName).test(tsdUmbrellaInclude) === false) {
        var toWrite = echo("\n/// <reference path='"+moduleName+ "/" + moduleName + ".d.ts'/>")
        toWrite.toEnd(TSD_UMBRELLA_INCLUDE_PATH)
    }

    pushd('./typings/' + moduleName)
    ln('-sf', tsdFile, linkFile)
    popd()
}

function unlinkLocalTSD(moduleName) {
    var tsdDir = './typings/' + moduleName
    rm('-rf', tsdDir)

    var linesContainingModule = regexForReferenceToModule(moduleName)
    var grepped = grep('-v', linesContainingModule, TSD_UMBRELLA_INCLUDE_PATH)
    grepped.pipeTo(TSD_UMBRELLA_INCLUDE_PATH)
}

function regexForReferenceToModule(moduleName) {
    return RegExp('\\/\\/\\/\\s*\\<\\s*reference\\s+path\\s*=\\s*["\']' + moduleName + '\\\/' + moduleName + '\\.d\\.ts', 'g')
}

function removeReferencePathLines(line) {
    var shouldRemove = /^\s*\/\/\/\s*\<\s*reference\s+path/.test(line)
    return !shouldRemove
}

function removeGeneratedBuildProducts(fromDir) {
    ls(fromDir).filter (isFileGeneratedBuildProduct)
               .map    (function (file) { return path.join(fromDir, file) })
               .forEach(function (file) { rm('-f', file) })
}

function isFileGeneratedBuildProduct(file) {
    return /\.d\.ts|\.js\.map|\.js/.test(file)
}

function log(str) {
    var padding = ''
    for (var i = 0; i < log.folderDepth; i++) { padding += log.tab }
    process.stderr.write('[make.js] ' + padding + str + '\n')
}

function mv(opts, src, dest) {
    // var args = Array.prototype.slice.call(arguments)
    log(chalk.white.bold('>> ') + chalk.blue('mv ') + chalk.blue.bold(src) + chalk.white.bold(' -> ') + chalk.cyan(dest))
    sh.mv(opts, src, dest)
}

function rm(opts, victim) {
    // var args = Array.prototype.slice.call(arguments)
    log(chalk.white.bold('>> ') + chalk.blue('rm ') + chalk.blue.bold(opts) + chalk.cyan(victim))
    sh.rm(opts, victim)
}

function mkdir(flags, dirpath) {
    // var args = Array.prototype.slice.call(arguments)
    log(chalk.white.bold('>> ') + chalk.green('$ mkdir ') + chalk.green.bold(flags + ' ' + dirpath))
    sh.mkdir(flags, dirpath)
}

function pushd(dir) {
    log(chalk.white.bold('>> --> into ') + chalk.red.bold(dir))
    log.folderDepth++
    sh.pushd(dir)
}

function popd() {
    log.folderDepth--
    var before = process.cwd()
    sh.popd()
    var after = process.cwd()
    var relativePath = path.relative(after, before)
    log(chalk.white.bold('>> <-- out of ') + chalk.green.bold(relativePath))
}

function ln(opts, realPath, linkPath) {
    log(chalk.white.bold('>> ') + chalk.yellow('ln ' + opts + ' ') + chalk.red(realPath) + chalk.white.bold(' <--> ') + chalk.red(linkPath))
    sh.ln(opts, realPath, linkPath)
}

function exec(cmd) {
    // var args = Array.prototype.slice.call(arguments)
    log(chalk.white.bold('>> ') + chalk.magenta('$ ') + chalk.magenta.bold(cmd))
    return sh.exec(cmd)
}



// function concatFiles()
// {
//     var args = Array.prototype.slice.call(arguments)
//     if (args[0] instanceof Array) {
//         args = args[0]
//     }

//     var files = {}
//     args.forEach(function (filename) { files[filename] = fs.readFileSync(filename).toString() })
//     return args.map(function (filename) { return files[filename] }).join('\n\n')
// }




