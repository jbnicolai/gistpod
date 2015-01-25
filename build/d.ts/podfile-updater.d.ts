/// <reference path="../../typings/tsd.d.ts" />
import cli = require('cli-components');
import when = require('when');
import $ = cli;
export = PodfileUpdateCommand;
declare class PodfileUpdateCommand {
    podfileDir: string;
    cache: $.Cache;
    constructor(_cache: $.Cache);
    writePodfileFromTemplate(podfileDir: string): when.Promise<void>;
    writePodfile(podfileDir: string, podfileContents: string): when.Promise<void>;
    expandPodfileVariables(podfileDir: string): when.Promise<string>;
    expandVariable(podfileContents: string, foundPod: string): string;
    backupPodfile(podfilePath: any): when.Promise<string>;
}
