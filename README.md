
# gistpod

```
Usage: gistpod [options] [command]


  Commands:

    username <username>         set the GitHub username from which to retrieve gists (config file: ~/.gistpod)
    url <pod>                   look up the latest gist URL for the specified CocoaPod
    pull                        pull the latest data from the GitHub API into your local cache (~/.gistpod-cache)
    update <Podfile> [pods...]  updates the gist refs for the given Pods (or all Pods, if none are specified) in the specified Podfile to the latest revisions
    list                        list known podspec gists
    help [cmd]                  display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

CLI tool (written in node.js) to facilitate using GitHub gists as temporary CocoaPods podspecs.

**Works with Swift-enabled versions of CocoaPods** (`gem install cocoapods --pre`).  In fact, that's pretty much the only reason I made this.

Given how much of the Swift code out in the wild still has no official podspec (and, for that matter, given all of the one-page microclasses I've found myself writing in Swift), I've been using **gists** (<https://gist.github.com>) pretty frequently to deal with temporary (and rapidly-changing) podspecs during fast development cycles.

But the problem, as far as I can tell, is that any time you commit a change to a gist, the raw gist URL changes.  (I'm not aware of any redirect URL to the actual raw source... is anyone else?).  That means that every time you change a podspec, you'll be stuck copying its new gist URL around to all of your `Podfiles` manually.

**Can NOT be trifling with that.**  I'd much rather just `Cmd-Tab` into iTerm and run something... like...

```sh
$ gistpod update

Podfile updated.
```



# moar examples

```
 $ gistpod list

Pod                      Podspec gist URL
-------------------      ------------------------------------------------------------------
ReactiveCocoaSwift       https://gist.github.com/brynbellomy/.../ReactiveCocoaSwift.podspec
JSTilemap                https://gist.github.com/brynbellomy/.../JSTilemap.podspec
Signals                  https://gist.github.com/brynbellomy/.../Signals.podspec
Starscream               https://gist.github.com/brynbellomy/.../Starscream.podspec
Basis                    https://gist.github.com/brynbellomy/.../Basis.podspec

# the update command is:
# $ gistpod update [Podfile directory] [pods to update]
$ gistpod update . Starscream ReactiveCocoa-Swift

Podfile updated.
```

- `gistpod list`:
    
    0. queries your GitHub account for all gists containing at least one `podspec` file — i.e., matching the pattern `*.podspec`...
    0. ...and displays the direct, raw URL to the latest revision of each podspec's gist.

    *(Note: just to be totally clear, I added the dot-dot-dots.  The command gives the full path.)*

-------------

- `gistpod update`:

    0. **backs up** `<project root>/Podfile` to `~/.gistpod-backup`, ...
    0. **reads your Podfile template** from `<project root>/Podfile.gistpod`, and then ...
    0. **writes an updated Podfile** to `<project root>/Podfile`.  Each pod placeholder (`#{Starscream}`, etc.) is replaced by its respective URL (from the `gistpod list` command).
    
    Now you can `pod install` your heart out, confident that your jank-ass, ghetto-rigged ("dev") in-house podspecs are all at least referencing the latest commits in your gist account.

-------------



# install

Install with `npm`

```sh
$ npm install -g gistpod
```

Set your GitHub username (one-time):

```sh
$ gistpod username brynbellomy
```

Now you can list all of the podspecs that you have stored as gists:

```sh
$ gistpod list
```

_**@@TODO:** display a diff if there were any changes_




# main usage/workflow

### 1. Make a copy of your `Podfile` called `Podfile.gistpod`.

Put it in `<project root>`, alongside the original:

```sh
$ cp Podfile Podfile.gistpod
```

### 2. Open `Podfile.gistpod`.

You will need to change the `:podspec => '...'` URLs for any of the podspecs that you want to keep automatically synced with your gists account.  The entire podspec URL (including quotes) must be replaced with the placeholder `#{PodName}`.

**In other words,** change this:

```ruby
platform :osx, '10.10'

pod 'Starscream', :podspec => 'https://raw.github.com/dfd19ac23..../Starscream.podspec'
pod 'ReactiveCocoa-Swift', :podspec => 'https://raw.github.com/fdc2a3d19..../ReactiveCocoa-Swift.podspec'
```

...to this:

```ruby
platform :osx, '10.10'

pod 'Starscream', :podspec => #{Starscream}
pod 'ReactiveCocoa-Swift', :podspec => #{ReactiveCocoa-Swift}
```



### 3. Update your local cache of podspec URLs with `gistpod pull`.

```sh
$ gistpod pull
```

_**@@TODO:** display a diff if there were any changes_




### 4. Run `gistpod update` to update the URLs in your `Podfile`.

This does the inverse of **step 3**: it finds all of those `#{PodPlaceholders}` in your `Podfile.gistpod` and replaces each one with the latest commit URL for its respective podspec.

```sh
$ gistpod update [optional path to Podfile] [optional list of pods to update]
```

Any time you run `gistpod update`, your `Podfile` is backed up (to `~/.gistpod-backup`) and then overwritten with a new `Podfile` built from its accompanying `Podfile.gistpod`.  The `#{PodPlaceholders}` will be replaced by URLs pointing at the latest revision of each of your gist podspecs on GitHub.



# other commands

The `gistpod url` command returns *only* the gist URL for a given podspec (and not a byte more or less):

```sh
$ gistpod url Starscream
```

This is useful if you're doing any kind of shell scripting, or if you want to (painlessly) copy the URL to the clipboard, or...

```sh
$ gistpod url Starscream | pbcopy
```




# authors

bryn austin bellomy < <bryn.bellomy@gmail.com> >

