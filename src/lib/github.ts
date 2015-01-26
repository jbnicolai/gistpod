/// <reference path='../../typings/tsd.d.ts' />

import request   = require('request')
import when      = require('when')
import when_node = require('when/node')
import http      = require('http')


export function getAllGists (username:string) :when.Promise<Gist[]>
{
    var options :request.Options = {
        headers: { 'User-Agent': 'gistpod' },
        // url: "https://api.github.com/users/" + username + "/gists",
    }

    return when.promise((resolve, reject) => {
                request("https://api.github.com/users/" + username + "/gists", options, (error:any, response:any, body:string) => {
                    switch (response.statusCode) {
                        case 200: return resolve(body)
                        case 404:
                        default:  return reject(new Error('Error: GitHub API response status code was "' + response.statusCode + '".  Did you set your username correctly?'))
                    }
                })
            })
            .then(body => when.attempt(JSON.parse, body))
            .then(gistArray => <Gist[]>gistArray)
}

export interface Gist
{
    url: string;
    forks_url: string;
    commits_url: string;
    id: string;
    git_pull_url: string;
    git_push_url: string;
    html_url: string;
    files: GistFilesDictionary;
    "public": boolean;
    created_at: string;
    updated_at: string;
    description: string;
    comments: number;
    user: string;
    comments_url: string;
    owner: GistOwner;
}

export interface GistFilesDictionary {
    [index: string]: GistFileMetadata;
}

export interface GistFileMetadata {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
}

export interface GistOwner {
    login: string;
    id: number;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}
