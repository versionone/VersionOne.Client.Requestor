![Powered by VersionOne](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/VersionOne.FeatureRequestor/images/poweredbyv1.png)

## Introduction

When seeking input on the backlog, would it encourage collaboration with more stakeholders across the organization if they could submit requests to a simple, stand-alone web application, without having to login and navigate an agile project management tool? The VersionOne Requestor is a single-page web application that can be customized with custom fields and your organization's style. The Requestor is a simple way for internal stakeholders to submit and edit requests for new features or to report defects, without having access to the full VersionOne application or knowledge of your VersionOne project structure. So what? Stakeholders are infrequent users of agile project management software; hence, they often forget the right combination of menu options and project structure to submit requests in the right place. By removing these obstacles to collaboration, more stakeholders can provide feedback without frustration.

For more about the features of the VersionOne Requestor, see the blog post on [Introduction and Why You'd Need It](http://blogs.versionone.com/agile-development/2013/02/07/feature-requestor-what-and-why/)

![Feature Requestor](https://raw.github.com/versionone/VersionOne.Requestor.NET/master/blog/part02/requestor-07-update.png)

For broader collaboration including external customers, and deeper collaboration including comments and voting, check out [VersionOne Ideas](http://www.versionone.com/Product/agile-idea-management-tool/).

### Implementation

It's implemented in 100% HTML, CSS, and JavaScript/CoffeeScript and uses several popular open source libraries like jQueryMobile, Backbone.js, and Backbone Forms.

### Customization

**It's designed to be easily customizable for you, so please let us know what you need if you need help. We also welcome your own contributions to this project. So, fork away!**

## Installation

Contact us if you are interested in this. It's brand new, and currently in use by one customer. We'd like to work with you to make sure we help you get what you need.

## Use with Hosted V1

### IIS Deploy

To let IIS serve the files for you:

1. Clone this repository or download the files as a zip and place the contents of the `VersionOne.FeatureRequestor` folder into a directory, such as `C:\inetpub\wwwroot\v1requestor`.
2. In IIS, from the `Connections` panel, open `Sites` and select or create a site.
3. Right click on the site and select `Add Application` or `Add Virtual Directory`.
4. Enter `v1requestor` for `Alias`, and for `Physical Path` put the directory you used in step 1.
5. Click `Ok`.
6. Browse to the new site. If you placed it directly into the default site, the address should be 
[`http://localhost/v1requestor`](http://localhost/v1requestor).
7. See the `How to configure for your VersionOne instance and projects` below.

### File Share Deploy

While it's probably better to install on a web server, you can actually run the Feature Requestor from a file share, but you have to enable a special flag in Google Chrome to do so. But, it appears this feature of Chrome was "rushed", so if you really want to do it, [read about the `--allow-file-access-from-files` Chrome option](http://stackoverflow.com/questions/4270999/google-chrome-allow-file-access-from-files-disabled-for-chrome-beta-8).

## Use with On-Premise V1

If you have your own instance installed on premise, we are still working on documentation for that. So, contact us for help.

## Configure for V1 Projects

There are two configuration files:

1. config.js (or config.coffee) -- specifies the URL for VersionOne and a few other options
2. fields.js (or fields.coffee) -- specifies the projects and fields you want to display on the request form for each project

## config.js

Most importantly, change the `host`, `service`, and `versionOneAuth` variables to point to your own VersionOne instance. By default, they point to the VersionOne test instance.

### host

*Url, default: http://eval.versionone.net*

The web server address where your VersionOne instance is locaated, most likely something like `http://www7.v1host.com` or `http://www11.v1host.com`.

### service

*Url, default: http://eval.versionone.net/platformtest/rest-1.v1/Data/*

The complete url for the Versionone REST API endpoint for your instance, ending with a `/`. If you log in to your instance at `http://www11.v1host.com/TeamAwesome`, then your REST API endpoint url is `http://www11.v1host.com/TeamAwesome/rest-1.v1/Data/`.

### versionOneAuth

*String, default: admin:admin*

Authentication credentials for a user that can submit a feature request into the projects you specify in `fields.js`. You should take care to give this user only the permissions you want, perhaps only to add requests for those projects. 

This must be in the form of `username:password`. This value gets [Base64-encoded](http://en.wikipedia.org/wiki/Base64) and sent as an HTTP `Authorization` header.

*Note:* we have some code for an alternative way of authenticating, but we're not finished with it. If you're interested in that, let us know.

### projectListClickTarget

*String, default: new*

This controls what happens when a user clicks a project name after searching

Valid values are:

* `new` -- open a new blank request form
* `list` -- open the list of existing requests to filter and select

### others

Modify the others to your heart's content.

## fields.js

The fields.js file is where specifies the fields that will be visiible for all projects or for specific projects when adding or editing a request.

## Specify default fields

To specify which fields to show up for all projects by default, define the a setting named `default`, like this:

```javascript
'default': {
  RequestedBy: {
    title: 'Requested By',
    autofocus: true
  },
  Name: {
    title: 'Request Title'
  },
  Description: {
    title: 'Request Description (Project & Why needed)',
    type: 'TextArea',
    optional: true
  },
  Priority: {
    title: 'Priority',
    type: 'Select',
    assetName: 'RequestPriority'
  }
}
```
## Field options

Each entry within the `default` project is keyed by the physical name of the corresponding VersionOne attribute or relationship. The entry itself is an object can contain the following options. Note that all of these work fine with the built-in VersionOne asset attributes as well as custom fields.

### title

*String, default: <key>*

The label to appear above the input field.

### type

*Backbone Forms field type, default: text*

Specifies the input element type for the field, based on [Backbone Forms](https://github.com/powmedia/backbone-forms) field types. You can compare this with the meta data for the field to get it right -- see [VersionOne Meta API](http://community.versionone.com/sdk/Documentation/MetaAPI.aspx).

### autofocus

*Boolean, default: false*

Set this to true if you want a field to autofocus on load. It sets the HTML 5 `autofocus` attribute in the input element. Obviously, it will only work with one field.

### optional

*Boolean, default: false*

By default, all fields will be required, unless you set this to `false`!

### Backbone Forms docs

Check out the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for more information on how you can utilize and customize the form fields.

## Relation options

The tool supports basic use with relations by showing them in a select element. This works with both built-in and custom list types.

### Example relation

From above:

```javascript
Priority: {
  title: 'Priority',
  type: 'Select',
  assetName: 'RequestPriority'
}
```

A Request asset has a `Request.Priority` attribute, which is of type RequestPriority. You can see that in the meta data for a Request at: [http://eval.versionone.net/platformtest/meta.v1/Request?xsl=api.xsl](http://eval.versionone.net/platformtest/meta.v1/Request?xsl=api.xsl)

And, you can find the list of possible values at [http://eval.versionone.net/platformtest/rest-1.v1/Data/RequestPriority](http://eval.versionone.net/platformtest/rest-1.v1/Data/RequestPriority)

In the `Specify fields for specific projects` section, you'll see this:

```javascript
Custom_ProductService: {
  title: 'Product/Service',
  type: 'Select',
  assetName: 'Custom_Product'
}
```

In that case, a customer chose to name the attribute `Custom_ProductService`, which can take values from the list of the custom list-type named `Custom_Product`. **There is no requirement that the `Custom_` prefix appear in a custom field, however!**

## Specify fields for individual projects

For a sepcific project, you define fields with a key named after the project's Scope oid, like below. Note that this even lets you even use custom fields that are defined in your VersionOne instance. The `type` parameter refers to the field types available in [Backbone Forms](https://github.com/powmedia/backbone-forms).

```javascript
'Scope:173519': {
  RequestedBy: {
    title: 'Requested By',
    autofocus: true
  },
  Name: {
    title: 'Request Title'
  },
  Custom_RequestedETA: {
    title: 'Requested by (ETA)',
    type: 'Date'
  },
  Description: {
    title: 'Request Description (Project & Why needed)',
    type: 'TextArea',
    optional: true
  },
  Custom_ProductService: {
    title: 'Product/Service',
    type: 'Select',
    assetName: 'Custom_Product'
  },
  Custom_Team2: {
    title: 'Team',
    type: 'Select',
    assetName: 'Custom_Team'
  },
  Custom_HWRequestedlistandcostperunit: {
    title: 'Capacity or HW Requested',
    type: 'TextArea'
  },
  Custom_RequestImpact: {
    title: 'Request Impact',
    type: 'Select',
    assetName: 'Custom_Severity'
  }
}
```

## Advanced: CoffeeScript

The main source for the app is actually CoffeeScript. It's been compiled to JavaScript, and those files are here in the repository, but if you'd prefer to customize the code in CoffeeScript rather than muck with JavaScript, then do this:

1. Install [Node.js](http://nodejs.org/) if you don't already have it.
2. Open a command prompt and change directory to where the `VersionOne.FeatureRequestor` folder is in your local repository clone.
3. Type `npm install coffee-script` (Or, [see alternatives for installing CoffeeScript](http://coffeescript.org/#installation)).
4. Type `./make.sh` to execute the CoffeeScript compiler. This is a simple script that regenerates a few `.js` files from the `.coffee` files in the project.
