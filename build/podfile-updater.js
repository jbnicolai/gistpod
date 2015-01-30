/// <reference path='../../typings/tsd.d.ts' />
var path = require('path');
var fs = require('fs-extra');
var cli = require('cli-components');
var when_node = require('when/node');
var $ = cli;
var fsp = when_node.liftAll(fs);
var PodfileUpdateCommand = (function () {
    function PodfileUpdateCommand(_cache) {
        this.cache = _cache;
    }
    PodfileUpdateCommand.prototype.writePodfileFromTemplate = function (podfileDir) {
        var _this = this;
        return this.expandPodfileVariables(podfileDir).then(function (newContents) { return _this.writePodfile(podfileDir, newContents); });
    };
    PodfileUpdateCommand.prototype.writePodfile = function (podfileDir, podfileContents) {
        var podfilePath = path.join(podfileDir, 'Podfile');
        return this.backupPodfile(podfilePath).then(function () { return fsp.writeFile(podfilePath, podfileContents); });
    };
    PodfileUpdateCommand.prototype.expandPodfileVariables = function (podfileDir) {
        var _this = this;
        var PATHS = {
            'Podfile': path.join(podfileDir, 'Podfile'),
            'Podfile.gistpod': path.join(podfileDir, 'Podfile.gistpod'),
        };
        return fsp.readFile(PATHS['Podfile.gistpod'], 'utf8').then(function (buffer) { return buffer.toString(); }).then(function (templateContents) {
            return templateContents.match(/#\{[a-zA-Z0-9_\-\+]+\}/g).map(function (str) { return str.replace(/[#\{\}]/g, ''); }).reduce(function (pfcontents, foundpod) { return _this.expandVariable(pfcontents, foundpod); }, templateContents);
        });
    };
    PodfileUpdateCommand.prototype.expandVariable = function (podfileContents, foundPod) {
        var gists = this.cache.fetch('gists');
        if (gists == null || gists == undefined) {
            return podfileContents;
        }
        var entry = gists.filter(function (entry) { return entry.name == foundPod; }).shift(); //[foundPod]
        if (entry != null && entry != undefined) {
            var currentPodspecURL = entry.raw_url.replace('githubusercontent.com', 'github.com');
            podfileContents = podfileContents.replace('#{' + foundPod + '}', "'" + currentPodspecURL + "'");
        }
        return podfileContents;
    };
    PodfileUpdateCommand.prototype.backupPodfile = function (podfilePath) {
        var backupDir = $.file.tmpdir();
        return $.file.createBackup(podfilePath, backupDir);
    };
    return PodfileUpdateCommand;
})();
function mapGistPodspecArrayToObject(entries) {
    var obj = {};
    for (var i in entries) {
        var entry = entries[i];
        obj[entry.name] = entry.raw_url;
    }
    return obj;
}
module.exports = PodfileUpdateCommand;
