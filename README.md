
# gistpod

CLI tool (written in node.js) to facilitate using GitHub gists as temporary CocoaPods podspecs (for repos that have no podspec).  Solely for when I'm in a hurry.


# usage

Set your GitHub username (one-time):

```sh
$ gistpod username brynbellomy
```

Now refresh your local cache:

```sh
$ gistpod update
```

And now you can use the `list` and `url` commands:

```sh
$ gistpod list
$ gistpod url Starscream | pbcopy
```


# authors

bryn austin bellomy < <bryn.bellomy@gmail.com> >

