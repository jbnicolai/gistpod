#!/usr/bin/env node

require('shelljs/global')

processArgs()

function processArgs() {
    var argv = process.argv
    argv.shift()
    argv.shift()

    if (argv.length > 0) {
        switch (argv[0]) {
            case 'build': build(); break
            case 'clean': clean(); break
            default:      console.log('unknown command'); process.exit(1)
        }
    }
    else { build() }
}


function build()
{
    mkdir('-p', './build')
    var result = exec('tsc ./src/index.ts --module commonjs --target ES6 --outDir ./build --sourceRoot ./src --declaration')

    if (result.code !== 0) {
        process.exit(result.code)
    }

    mkdir('-p', './lib')
    ls('./build/lib/*.*').forEach(function (file) { mv('-f', file, './lib/') })
    ls('./build/index.*').forEach(function (file) { mv('-f', file, './') })
    rm('-rf', './build')
}

function clean()
{
    rm('-rf', './build', './lib')
    rm('./index.js', './index.d.ts', './index.js.map')
}

