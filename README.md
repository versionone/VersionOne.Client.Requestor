VersionOne.FeatureRequestor App
========================

TODO: add links to blog series

VersionOne Feature Requestor is a simple app that lets users submit new feature requests into VersionOne through the 
VersionOne REST Data API. It also lets them edit these feature requests. A feature request in can eventually become a 
User Story, or even other types of assets, like Epics.

It's implemented in 100% HTML, CSS, and JavaScript/CoffeeScript and uses several popular open source libraries like 
jQueryMobile, Backbone.js, and Backbone Forms.

**It's designed to be easily customizable for you, so please let us know what you need and we can help you do it. We 
also welcome your own contributions to this project. So, fork away!**

# Contact us if you want use with a private, on premise instance

If you have your own instance installed on premise, we are still working on documentation for that. So, contact us 
if you'd like help. Working through it with you will help us too.

# Options for how to use with a hosted VersionOne instance

If you want to run this against a VersionOne hosted instace, please contact us because it depends on a 
few 'experimental' DLLs for enhanced JSON support in the API that we have to install for you. **Note**: this 
support will become part of the Core product soon.

## 1. How to use over a file share with Google Chrome

While it's probably better to install on a web server, you can actually run the Feature Requestor from a file share, but 
you have to enable a special flag in Google Chrome to do so. But, it appears this feature of Chrome was "rushed", so if 
you really want to do it, [read about the `--allow-file-access-from-files` Chrome option]
(http://stackoverflow.com/questions/4270999/google-chrome-allow-file-access-from-files-disabled-for-chrome-beta-8).

## 2. How to deploy to IIS

To let IIS serve the files for you:

1. Clone this repository or download the files as a zip and place the contents of the `VersionOne.FeatureRequestor` 
folder into a directory, such as `C:\inetpub\wwwroot\v1requestor`.
2. In IIS, from the `Connetions` panel, open `Sites` and select or create a site.
3. Right click on the site and select `Add Application` or `Add Virtual Directory`.
4. Enter `v1requestor` for `Alias`, and for `Physical Path` put the directory you used in step 1.
5. Click `Ok`.
6. Browse to the new site. If you placed it directly into the default site, the address should be 
[`http://localhost/v1requestor`](http://localhost/v1requestor).
7. See the `How to configure for your VersionOne instance and projects` below.

# How to configure for your VersionOne instance and projects

There are two configuration files:

1. config.js (or config.coffee) -- specifies the URL for VersionOne and a few other options
2. fields.js (or fields.coffee) -- specifies the projects and fields you want to display on the request form for each 
project

## Options for config.js

TODO: clean up

Change the `host`, `service`, and `versionOneAuth` variables to point to your own VersionOne instance. By default, they 
point to the VersionOne test insance:

```javascript
host = 'http://eval.versionone.net';
service = 'http://eval.versionone.net/platformtest/rest-1.v1/Data/';
versionOneAuth = 'admin:admin';
```

### `projectListClickTarget`

This controls what happens when a user clicks a project name after searching

Valid values are:

* `new` -- open a new blank request form
* `list` -- open the list of existing requests to filter and select

## Options for fields.js

TODO: clean up

This is where you change the fields that will be visiible for all projects or for specific projects when adding or 
editing a request.

# Optional: how to recompile the CoffeeScript to regenerate the JavaScript files

The main source for the app is actually CoffeeScript. It's been compiled to JavaScript, and those files are here in the 
repository, but if you'd prefer to customize the code in CoffeeScript rather than muck with JavaScript, then do this:

1. Install [Node.js](http://nodejs.org/) if you don't already have it.
2. Open a command prompt and change directory to where the `VersionOne.FeatureRequestor` folder is in your local repository clone.
3. Type `npm install coffee-script` (Or, [see alternatives for installing CoffeeScript](http://coffeescript.org/#installation)).
4. Type `./make.sh` to execute the CoffeeScript compiler. This is a simple script that regenerates a few `.js` files 
from the `.coffee` files in the project.

# How to use with a service gateway

TODO: below is outdated

Did you see those credentials embedded in JavaScript above? Yes, that could suck. 
We're looking at better ways to enable this to work from the web browser, but we also have a way to proxy the request 
through a "service gateway", but we don't have instructions for that yet. You can see a C# version and a Node.js 
version in the source code of the project, however. Contact us if you would like to use these features.

