![Powered by VersionOne](https://raw.githubusercontent.com/versionone/VersionOne.Client.Requestor/master/VersionOne.FeatureRequestor/images/poweredbyv1.png)

## Introduction

When seeking input on the backlog, would it encourage collaboration with more stakeholders across the organization if they could submit requests to a simple, stand-alone web application, without having to login and navigate an agile project management tool? The VersionOne Requestor is a single-page web application that can be customized with custom fields and your organization's style. The Requestor is a simple way for internal stakeholders to submit and edit requests for new features or to report defects, without having access to the full VersionOne application or knowledge of your VersionOne project structure. So what? Stakeholders are infrequent users of agile project management software; hence, they often forget the right combination of menu options and project structure to submit requests in the right place. By removing these obstacles to collaboration, more stakeholders can provide feedback without frustration.

For more about the features of the VersionOne Requestor, see the blog post on [Introduction and Why You'd Need It](http://blogs.versionone.com/agile-development/2013/02/07/feature-requestor-what-and-why/)

![Feature Requestor](https://raw.githubusercontent.com/versionone/VersionOne.Client.Requestor/master/blog/part02/requestor-07-update.png)

For broader collaboration including external customers, and deeper collaboration including comments and voting, check out [VersionOne Ideas](http://www.versionone.com/Product/agile-idea-management-tool/).

### Browser Requirements

This tool has been tested with Google Chrome, and partially with Mozilla Firefox. It is known that it does 
not work with IE 9, but has not been tested on later versions. If you try it on other browsers and it works,
please let us know so we can update this.
c
### Implementation

It's implemented in 100% HTML, CSS, and JavaScript/CoffeeScript and uses several popular open source libraries like jQueryMobile, Backbone.js, and Backbone Forms.

### Customization

It's designed to be easily customizable for different custom fields and server locations. See below for details.

### Contributing

We also welcome contributions! Please send pull requests! If you figure out specific instructions for using the Node.JS based installation option under different OS or cloud-hosted configurations, please create a how-to document and submit a pull requests.

## How to use with your own On-Premise VersionOne

If you have your own instance of VersionOne installed on premise, and have full access to the IIS server, then the easiest thing to do is this:

* Modify the `config.js` file as described in the `Configure for VersionOne Projects` section below.
* Next, under `<VersionOne Installation Location>\Custom`, create a new folder named `Requestor` and copy all the files into it.
* **Note:** If you have the `Active Directory` authentication option configured for VersionOne, you'll need to ensure that **ASP Impersonation** is enabled in IIS, and that `Anonymous Authentication` is disabled.

You should now be able to navigate to the site at [http://localhost/VersionOne/Custom/Requestor](http://localhost/VersionOne/Custom/Requestor).

## How to run as a stand-alone Node.js process for On-Premise installations or Hosted instances

If you have a Hosted VersionOne instance, then you have two option types for running the Requestor. 

First, modify the `config.js`, and possibly the `fields.js` file as described by the `Configure for VersionOne Projects` section below. **Note**: you need to embed a username and password for the VersionOne user who will 

1. Run the provided Node.js web server on a server in your own internal network
2. Deploy the code to a cloud-hosted provider. We have documented [How To Deploy Requestor to Heroku for Free via a single click](HowTo-DeployInHeroku.md).

**If you figure out another option for how to deploy it, please send us a pull request with a file named like: *HowTo-DeployIn<provider>.md***

## Configure for VersionOne Projects

There are two configuration files:

1. config.js (or config.coffee) -- specifies the URL for VersionOne and a few other options
2. fields.js (or fields.coffee) -- specifies the projects and fields you want to display on the request form for each project

## config.js

Most importantly, change the `host`, `service`, and `versionOneAuth` variables to point to your own VersionOne instance. By default, they point to the VersionOne test instance.

**Note:** Unless you deployed the code into the `Custom` folder of your On-Premise VersionOne instance, then you must remember to put the URL of the server in a special format.

```javascript
host = 'http://where-you-deployed-requestor.com/pt/https://www.v1host.com';
service = host + '/v1instance/rest-1.v1/Data/';
```

The first part of the host, `http://where-you-deployed-requestor.com/pt/`, is the address to the Node.js based web server, including the special `/pt/` route, which handles [CORS proxying](http://enable-cors.org/) since the VersionOne system does not support CORS inherently. The second part, for example `https://www.v1host.com`, is the actual server base address where your VersionOne instance is installed.

The `service` variable simply tacks on the instance and REST api endpoint pathing to the `host` variable.

### host

*Url, default: https://www14.v1host.com*

The web server address where your VersionOne instance is locaated, most likely something like `http://www7.v1host.com` or `http://www11.v1host.com`.

### service

*Url, default: https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/*

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

A Request asset has a `Request.Priority` attribute, which is of type RequestPriority. You can see that in the meta data for a Request at: [https://www14.v1host.com/v1sdktesting/meta.v1/Request?xsl=api.xsl](https://www14.v1host.com/v1sdktesting/meta.v1/Request?xsl=api.xsl)

And, you can find the list of possible values at [https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/RequestPriority](https://www14.v1host.com/v1sdktesting/rest-1.v1/Data/RequestPriority)

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
