// Type definitions for ShellJS v0.3.0
// Project: http://shelljs.org
// Definitions by: Niklas Mollenhauer <https://github.com/nikeee>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../node/node.d.ts"/>

declare module CLIComponents {
    var blah: string;
}


declare module "cli-components" {
    export = CLIComponents;
}

import shell = require('shelljs');
import when = require('when');
import Promise = when.Promise;
export declare function needsBuild(file: string, builtProduct: string): boolean;
export declare function mtime(file: string): number;
export declare function formatResult(result: shell.ExecReturnValue): string;
export declare function prependStringToFile(file: string, str: string): Promise<void>;
export declare function createTypescriptCompileCmd(inFile: string, outFile: string): string;
export declare function compileTypescript(inFile: string, outFile: string): shell.ExecReturnValue;

import file = require('./file');
import when = require('when');
import Promise = when.Promise;
export declare class Cache implements file.IFileUsing {
    filePath: string;
    fileMinimumContents: string;
    filename: string;
    parentDir: string;
    fileManager: file.FileManager<Cache>;
    constructor(cacheFilename: string, parentDir?: string);
    fetch(key: string): Promise<{}>;
    store(key: string, value: {}): Promise<void>;
}

import when = require('when');
import file = require('./file');
import Promise = when.Promise;
export declare class Config implements file.IFileUsing {
    filePath: string;
    fileMinimumContents: string;
    filename: string;
    parentDir: string;
    private configJSON;
    fileManager: file.FileManager<Config>;
    private hasEnsuredFile;
    private ensureFile();
    constructor(configFilename: string, parentDir?: string);
    fetch(key: string): Promise<{}>;
    store(key: string, value: {}): Promise<void>;
}

import when = require('when');
import Promise = when.Promise;
export interface IFileUsing {
    filePath: string;
    fileMinimumContents: string;
}
export declare class FileManager<U extends IFileUsing> {
    fileUsing: U;
    constructor(fileUsing: U);
    writeValue(key: string, value: {}): Promise<void>;
    readValue(key: string): Promise<{}>;
    writeJSONFile(obj: {}): Promise<void>;
    readJSONFile(): Promise<{}>;
    ensureFile(): Promise<void>;
    ensureMinimumContents(filename: string, minimumContents: string): Promise<void>;
}

export declare function print(output: string): void;
export declare function dieError(err: any): void;
