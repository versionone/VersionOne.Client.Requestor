This set of walkthroughs demonstrates and describes the technical implementation of the VersionOne Requestor tool.

# Requestor Tool Goals

The Requestor Tool implementation serves multiple goals:

* Provide a code sample that customers and developers can use, both to solve a common problem, and to learn about using the VersionOne API with simple, existing open source technologies
* Serve as a valuable testing ground for improved and simplified JSON support in the VersionOne API
* Spur conversations and ideas related to VersionOne and the "mobile web"

# Article Sections

1. Technologies Overview
2. Hands on Demo with JSON Request & Response Inspection
3. Backbone Forms and Model Binding Exercise
4. Modular and Mobile Architecture Details

# Technologies Overview

Just as the VersionOne API and Platform are open source, so are the technologies used in the Requestor tool. All of these are popular tools, many already in use by the VersionOne core team. Others are "up and coming", or tried and true libraries and frameworks in the web development and open source communities.

## Technology list
* VersionOne.SDK.Experimental Api Input / Output Translators -- converts JSON (HAL compliant) to V1 XML on inbound, and reverse on outbound
* RequireJS -- module loading
* Backbone Forms -- dynamically creates the HTML form based on a lightweight "schema" defined in JS
* jQueryMobile -- mobile-friendly HTML5 framework
* Backbone.js -- only utilizing Backbone.Events and models at a rudimentary level right now
* jsRender -- jQuery Templates successor
* toastr -- simple "toast" status messages
* CoffeeScript -- love it, or leave it, that's your choice. I dig it.

## Areas for Possible Improvement

Before even starting to examine code, let me say where I already believe improvements can be made so that you can keep these in mind, along with any other ideas you generate:

* Break up the v1AssetEditor into a few smaller parts
* Reduce use of callbacks (already using Backbone.Events in a couple key places) and jQuery Promises
* Better use of Backbone events, models, collections, views, routes, etc?
* Possible simplification with the YAML query support Joe Koberg has created for the multiple dropdown lists -- which are populated from custom field values specific to a customer's project
* Explore use of Backbone.sync + localStorage. [See this project](http://documentcloud.github.com/backbone/docs/backbone-localstorage.html) -- This would be for people able to create requests "off line", saved to localStorage, then put them into VersionOne when they are ready to, or when they have a network connection
* Throw in some "Infinite Genericization" of the "v1AssetEditor" -- something that is entirely model-driven and can edit any type of asset based on its Meta definition
* Use of Jade for templates -- see this open-source project I'm working on for an example: [OpenEpi Mobile](http://www.github.com/JogoShugh/OpenEpi.com.jQueryMobile)

## Hands on Demo with JSON Request & Response Inspection

At the heart of this app is [JSON](http://www.json.org/). VersionOne does not yet natively support the JSON format that we use in this app. But, the DLLs from VersionOne.SDK.Experimental add that support in an unobtrusive way with a simple `Web.config` change.

Before looking at the code, let's step through the events using Chrome's console (F12 brings it up) to examine the HTTP requests and responses.

## 1. Search for projects by name

* First, using Chrome, open the console by hitting `F12`, and select the Network tab
* Open `http://localhost/v1requestor/index.html`
* Type `system` into the text box
* Hit enter

### Request generated

In the Chrome console's Network tab, we can inspect the request and response:

#### Headers

```text
GET /VersionOne.Web/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name HTTP/1.1
Host: localhost
Connection: keep-alive
Authorization: Basic YWRtaW46YWRtaW4=
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11
Accept: */*
Referer: http://localhost/v1requestor/index.html
Accept-Encoding: gzip,deflate,sdch
Accept-Language: en-US,en;q=0.8
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3
```

Notice the Authorization header, which contains the Base64 encoded credentials. This string gets created using Chrome's `btoa` function, but if `options.serviceGateway` is defined, it will get that string fromm the gateway instead of hard-coding the credentials in the script. (I'm not pretending that this is secure, it's just for covenience right now)

#### URL

```
http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name
```

Various VersionOne API parameters comprise this request:

* `sel=Name` -- return only the *Name* attribute from the remote resource
* `page=100,0` -- return 100 items max, starting at page 0
* `find='system'` -- search for the word `system`
* `findin=Name` -- search for `find` within the `Name` attribute only


### Response received

The response Content-Type header is `haljson`. [HAL is a proposed standard](http://stateless.co/hal_specification.html) for hypermedia documents.

#### Headers

```text
HTTP/1.1 200 OK
Cache-Control: no-cache
Pragma: no-cache
Content-Length: 186
Content-Type: haljson; charset=utf-8
Expires: -1
Server: Microsoft-IIS/7.5
X-Powered-By: ASP.NET
Access-Control-Allow-Origin: *
Date: Mon, 14 Jan 2013 22:34:20 GMT
```

#### Body

```json
[
  {
    "Name": "System (All Projects)",
    "_links": {
      "self": {
        "href": "/VersionOne.Web/rest-1.v1/Data/Scope/0",
        "id": "Scope:0"
      }
    }
  }
]
```

## 2. Select a project and fetch its Requests assets

* Still with the Chrome console and Network tab open, click the 'System (All Projeccts)` result
* Click the `List` button to fetch the Request list

### Request URL generated

```text
http://localhost/VersionOne.Web/rest-1.v1/Data/Request?acceptFormat=haljson&where=Scope%3D'Scope%3A0'&sel=Name%2CRequestedBy&page=75%2C0&sort=-ChangeDate
```

Again, various VersionOne API parameters comprise this URL:

* `where=Scope='Scope:0' -- return a Scope asset with the given id
* `sel=Name,RequestedBy` -- return the Name and RequestedBy attributes of this Scope asset
* `page=75,0` -- return 75 items max, starting at page 0
* `sort=-ChangeDate` -- sort the results in desending order by the ChangeDate attribute

### Response received

The response contains an array of JSON objects that contain only the Name and RequestedBy attributes. This then gets used to populate the listview.

```json
[
  {
    "RequestedBy": "Blaine Stussy",
    "Name": "Add the Custom_Team custom field to the Request form",
    "_links": {
      "self": {
        "href": "/VersionOne.Web/rest-1.v1/Data/Request/2094",
        "id": "Request:2094"
      }
    }
  },
  {
    "RequestedBy": "Ian Buchanan",
    "Name": "As an API Adopter, I can deploy the Requestor Tool easily",
    "_links": {
      "self": {
        "href": "/VersionOne.Web/rest-1.v1/Data/Request/2093",
        "id": "Request:2093"
      }
    }
  },
  {
    "RequestedBy": "Blaine Stussy",
    "Name": "Date fields should look better",
    "_links": {
      "self": {
        "href": "/VersionOne.Web/rest-1.v1/Data/Request/2092",
        "id": "Request:2092"
      }
    }
  }
]
```

## 3. Select a Request to edit

* Now click the `Add the Custom_Team custom field to the Request form` request

### Request URL generated

```text
http://localhost/VersionOne.Web/rest-1.v1/Data/Request/2094?acceptFormat=haljson&sel=RequestedBy%2CName%2CDescription%2CPriority
```

Again, various VersionOne API parameters comprise this URL:

* `/Data/Request/2094` -- the specific URL that uniquely identifies this Scope asset
* `sel=RequestedBy,Name,Description,Priority` -- return just these four attributes

### Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "Description": "Please add the Custom_Team field to the Request form for the CapEx project, and only the CapEx project",
  "Priority.Name": "High",
  "Name": "Add the Custom_Team custom field to the Request form",
  "RequestedBy": "Blaine Stussy",
  "_links": {
    "self": {
      "href": "/VersionOne.Web/rest-1.v1/Data/Request/2094",
      "id": "Request:2091"
    },
    "Priority": [
      {
        "href": "/VersionOne.Web/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ]
  }
}
```

## 4. Modify the Request and save

* Change the `Description` field to specify some more detail. I changed it to:

```text
Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project
```

* Click the `Save` button

### Request generated

#### URL
```text
http://localhost/VersionOne.Web/rest-1.v1/Data/Request/2094?acceptFormat=haljson
```

This time, the URL is nothing but the address of the asset, plus the `acceptFormat` parameter to the backend service.

#### POST body

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
  "_links": {
    "Scope": {
      "idref": "Scope:0"
    },
    "Priority": {
      "idref": "RequestPriority:169"
    }
  }
}
```
Note that because `Priority` is a Relation, there's no need to send the `Priority.Name`. Instead, it just sends a `_link` relation with the idref.

*TODO* perhaps it would be more RESTful to require sending the URL as an `href` param instead of the shorter `idref`. Thoughts?

Again, various VersionOne API parameters comprise this URL:

* `/Data/Request/2094` -- the specific URL that uniquely identifies this Scope asset
* `sel=RequestedBy,Name,Description,Priority` -- return just these four attributes

### Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
  "Name": "Add the Custom_Team custom field to the Request form",
  "RequestedBy": "Blaine Stussy",
  "_links": {
    "self": {
      "href": "/VersionOne.Web/rest-1.v1/Data/Request/2094/2745",
      "id": "Request:2094:2745"
    },
    "Priority": [
      {
        "href": "/VersionOne.Web/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ],
    "Scope": [
      {
        "href": "/VersionOne.Web/rest-1.v1/Data/Scope/0",
        "idref": "Scope:0"
      }
    ]
  }
}
```

Note the following about this response:

* It contains the same fields that we sent it, and only those fields
* The `_links.self.href` and `_links.self.id` properties contain the asset's `Moment`, which is a specific, very precise address of the asset. Since all asset changes are retained, this provides the exact location for this *version* of the asset. Note that if we now request the asset without the moment, the asset will still have the same state. However, someone else could change it before we do that. In case, we can always request this specific moment of the asset's state by using the moment-containing URL or id.
* TODO: I am not sure why it returned the Scope as a relation.



# Technical Highlights

## Backbone Forms

For a better understanding, take a look at the overview of [Backbone Forms](https://github.com/powmedia/backbone-forms) before proceding.

### Simple Backbone Forms Example

Or, for a summary understanding, here's one way a simple form is defined with Backbone Forms:

```html
<!-- Seriously, this is it: -->
<html>
<body></body>  
</html>
```

```css
/* Form */
.bbf-form {
  margin: 0;
  padding: 0;
  border: none;
}
```

```javascript
$(function() {
    var User = Backbone.Model.extend({
        schema: {
            title:      { type: 'Select', options: ['', 'Mr', 'Mrs', 'Ms'] },
            name:       'Text',
            email:      { validators: ['required', 'email'] },
            birthday:   'Date',
            password:   'Password',
            notes:      { type: 'List', listType: 'Text' }
        }
    });
    
    var user = new User({
        title: 'Mr',
        name: 'Sterling Archer',
        email: 'sterling@isis.com',
        birthday: new Date(1978, 6, 12),
        password: 'dangerzone',
        notes: [
            'Buy new turtleneck',
            'Call Woodhouse',
            'Buy booze'
        ]
    });
    
    var form = new Backbone.Form({
        model: user
    }).render();
    
    $('body').append(form.el);
});
```

[See it action here](http://jsfiddle.net/97U27/)

### Cooler Twitter Bootstrappified Backbone Forms Example with Subschema Object List

Or, [view this nice sample JSFiddle](http://jsfiddle.net/QY57e/) which uses Backbone Forms with the Twitter Bootstrap CSS and nested sub-models.

Note the `subSchema` definition for the weapon attribute.

### Dependent Dropdown Example

And, [This example](http://jsfiddle.net/nXHSX/) is a classic dependent dropdown example.


## VersionOne Customer and Project-Specific Field Configuration File

So, how do we use Backbone Forms in the Requestor? We use it with a bit of help.

### `fields.coffee` specifies form fields

The file `fields.coffee` contains the set of fields and their datatype, plus a few other attributes. For scalar types, it's very simple. See the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for possible values of the `type` attribute for form element types.

For VersionOne relations, here's an exampe:

With a built-in VersionOne asset, `RequestPrioerity`:

```coffeescript
fieldsConfig =
  Priority:
    title: 'Priority'
    type: 'Select'
    assetName: 'RequestPriority'
```

And, it's basically the same with a customer-created custom field:

```coffeescript
fieldsConfig =
  Custom_ProductService:
    title: 'Product/Service'
    type: 'Select'
    assetName: 'Custom_Product'
```

### `default:` sets up default form fields

By default, a project will use the fields specified in the `defuault` property.

### `Scope:NNNN`: sets up fields for a specific project

To override that set, simply use the project scope value, like `Scope:173519`.

Here's a complete example with both `default:` and an override:

```coffeescript
define ->
  fieldsConfig =
    default :
      RequestedBy:
        title: 'Requested By'
        autofocus: true

      Name:
        title: 'Request Title'

      Description:
        title: 'Request Description (Project & Why needed)'
        type: 'TextArea'
        optional: true

      Priority:
        title: 'Priority'
        type: 'Select'
        assetName: 'RequestPriority'

    'Scope:173519':
      RequestedBy:
        title: 'Requested By'
        autofocus: true
        
      Name:
        title: 'Request Title'

      Custom_RequestedETA:
        title: 'Requested by (ETA)'
        type: 'Date'

      Description:
        title: 'Request Description (Project & Why needed)'
        type: 'TextArea'
        optional: true

      Custom_ProductService:
        title: 'Product/Service'
        type: 'Select'
        assetName: 'Custom_Product'

      Custom_Team2:
        title: 'Team'
        type: 'Select'
        assetName: 'Custom_Team'

      Custom_HWRequestedlistandcostperunit:
        title: 'Capacity or HW Requested'
        type: 'TextArea'

      Custom_RequestImpact:
        title: 'Request Impact'
        type: 'Select'
        assetName: 'Custom_Severity'
```

# RequireJS: loading modules

RequireJS provides support for AMD (Asynchronous Module Definition) loading. [Learn details here](http://requirejs.org/docs/whyamd.html).

## index.html: `data-main='scripts/main'` specifies the "entry point" for the application

This is how we bootstrap the modules with RequireJS:

* Include `scripts/require.js`
* Specify the entry point using HTML5 `data-` attribute `data-main='scripts/main'`

RequireJS automatically creates `main.js` from `main`.

```html
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="Content/jquery.mobile-1.2.0.min.css" type="text/css" />
    <link rel="stylesheet" href="Content/jquery.mobile.v1.css" type="text/css" />   
    <link rel="stylesheet" href="Content/v1assetEditor.css" />
    <link rel="stylesheet" href="Content/toastr.css" />
    <link href="scripts/templates/bootstrap.css" rel="stylesheet" />
    <script src='scripts/require.js' data-main='scripts/main' type='text/javascript'></script>
</head>
```

## scripts/main.js: `require(...)` and `shim:` loading AMD friendly and AMD-challenged modules as one happy family

Inside this script:

* `requirejs.config` and `shim` coerces ordinary scripts to be good modular AMD citizens -- [See docs](http://requirejs.org/docs/api.html#config-shim).
* `require([...], function() )` defines the required modules and calls back when loaded
* Finally, wire up a jQuery document ready handler with `$()` and instantiate an instance of `v1AssetEditor`

### Notes
RequireJS will load the list of modules passed to `require()`, and then pass each one into the function parameter as a single object conforming to the [AMD pattern](https://github.com/amdjs/amdjs-api/wiki/AMD). Note that I've only declared formal parameters for the first three, because I only need to reference them. However, and I'm not sure why, I did have to load these modules via main, rather than as requirements for `v1AssetEditor`, where they are really needed. I don't understand why.

### `scripts/main.js` full text:

```javascript
requirejs.config({
  // The shim allows these non-AMD scripts to participate
	// in the AMDified loading for other modules
    shim: {
    	'underscore': {
    		exports: '_'
    	}
        ,'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
        ,'jsrender' : {
        	deps: ['jquery']
        }
    }
});

require([
        '../config',
        'v1assetEditor',
        'jquery',
        'backbone',
        'backbone-forms',
        'editors/list',
        'templates/bootstrap', 
    	'toastr',
        'jsrender'
    ],
    function(
        v1config,
        v1assetEditor,
        $)
    {
    	$(document).ready(function () {
    	    var editor = new v1assetEditor(v1config);
    	});
    }
);
```

# `config.coffee`: simplified Backbone Forms configuration

The first module passed to the initialization function in `scripts/main` was `../config`. 

This module sets some host-specific URLs and also takes in the `fields` module that we discussed above. It does some clean up of this so that when Backbone Forms processes it has all the attributes it needs. For example, `optional: true` will *prevent* the additional of `field.validators = ['required']`

### `config.coffee` full text:

```coffeescript
define ['./fields'], (fields) ->
  showDebugMessages = true
   
  host = 'http://localhost';
  service = 'http://localhost/VersionOne.Web/rest-1.v1/Data/';
  versionOneAuth = 'admin:admin';

  serviceGateway = false
  
  #var serviceGateway = 'http://localhost/v1requestor/Setup';

  projectListClickTarget = 'new'
  #projectListClickTarget = 'list'

  configureFields = (obj) ->
    for fieldGroupName, fieldGroup of obj
      for fieldName, field of fieldGroup
        if field.type == 'Select'
          field.options = [] # Ajax will fill 'em in
          field.editorAttrs =
            'data-class': 'sel'
            'data-assetName': field.assetName
            'data-rel': fieldName
        else
          if field.optional == true          
          else
            field.validators = ['required']
        if field.type == 'TextArea'
          field.editorAttrs =
            style: 'height:200px'
        if field.autofocus == true
          if not field.editorAttrs
            field.editorAttrs = {}
          field.editorAttrs.autofocus = 'autofocus'
        # Delete properties, if they exist, from field
        delete field.autofocus
        delete field.optional

  configureFields fields

  assetName = "Request"
  
  options =
    showDebug: showDebugMessages
    host: host
    service: service
    serviceGateway: serviceGateway
    versionOneAuth: versionOneAuth
    assetName: assetName
    formFields: fields
    projectListClickTarget: projectListClickTarget

  return options
```

# Highlights from `v1AssetEditor`

I'm not going to claim that `v1AssetEditor.coffee` is a perfect, modern example of MV* style development. Far from it!

As I listed above, there are a number of areas I think this can be improved, especially to take advantage of Backbone's features.

That being said, I'll highlight how jQuery Mobile, the fields config, Backbone Forms, and the VersionOne JSON support work together to simplify creating and editing a VersionOne Request.

And, leaving it at that, I'll ask for input and advice on how to evolve this into something more reusable for us as a team, and by extension, to external developers building on top of the VersionOne Platform and API.

## `index.html`: detail div (page) HTML

While it's not necessary to really understand jQuery Mobile in depth to grok the rest of this article, 
[you can view jQuery Mobile docs here](http://www.jquerymobile.com) to get a better understanding of how flexible and powerful it is.

Conceptually, jQuery Mobile allows you to define a desktop-friendly, mobile-optimized HTML5 ready page using standard HTML elements plus additional HTMl5 `data-` attributes that, on load, it scans for and use to configure and `enhance` the page.

You can create multiple "pages" by using `data-role='page'` on a simple `<div>` tag. And, more sophisticatedly, you can [dynamically creates pages and elements at run-time](http://jquerymobile.com/demos/1.2.0/docs/pages/page-dynamic.html).

Key highlights from below:

* `data-role="page"` sets up a div as a "page" that can be navigated to via hash tag, like `index.html#detail`
* Other `data-` attributes configure various other aspects of jQueryMobile to enhance the standard HTML elements into desktop & mobile friendly presentations
* The `<form>` and its contained `<div id="fields"></div>` element are where the form fields will get injected by Backbone Forms
* Finally, the two buttonns in the footer get wired up to event handlers inside of the `v1AssetEditor` class

```html
<div data-role="page" id="detail" data-theme="b"> 
    <div data-role="header" style="text-align:center;padding-top:5px" data-theme="b">
        <div>&nbsp;
            <img style="background:white;width:120px;padding:2px;margin-left:6px;" src="images/logo.png" border="0" align="left" /><span class="ui-block-b" style="font-size:120%;">&nbsp;&nbsp;Requestor App <span class='title'></span></span>
        </div>
        <div>&nbsp;
            <fieldset class="ui-grid-a">
                <div class="ui-block-a"><a href="#list" data-role="button" data-icon="arrow-u">List</a></div>
                <div class="ui-block-b"><a href="#" data-role="button" class="new" data-icon="plus">New</a></div>
            </fieldset>
        </div>
    </div>

    <div data-role="content" class="sideGradient">      
        <div id="assetFormDiv">
            <form id="assetForm">
                <div id="fields"></div>
            </form> 
        </div>
        <br />            
    </div>

    <div data-role="footer" data-theme="b" data-position="fixed">
        <fieldset class="ui-grid-a">
            <div class="ui-block-a">
                <a href="#" data-role="button" id="saveAndNew" data-icon="plus" data-mini="true">Save and New</a>
            </div>            
            <div class="ui-block-b">
                <a href="#" data-role="button" id="save" data-icon="check" data-mini="true">Save</a>
            </div>
        </fieldset>
    </div>    
</div>​
```

### Additional jQuery Mobile references

* [Backbone.js, RequireJS and jQuery Mobile](http://jquerymobile.com/test/docs/pages/backbone-require.html) -- not part of the 1.2.0 release, part of the upcoming release
* [PhoneGap apps with jQuery Mobile](http://jquerymobile.com/demos/1.2.0/docs/pages/phonegap.html)

## `v1AssetEditor.coffee`: constructor and initialize

### Summary
The `constructor` and `initialize` methods take care of setting up initial event handlers, sourcing config data from a service gateway (if configured), and subscribing to various jQuery Mobile events and a couple of custom events that are produced by Backbone.Events.

### Details
* `constructor` creates some property bags and also "mixes in" the options supplied from the caller. [See the MixIn pattern](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#mixinpatternjavascript)
* If the `options` hash contained a `serviceGateway` property with a value != false, then it will attempt to source the credentials from that URL, rather than rely on hard-coded credentials. This is by no means a sophisticated or highly secure way to do authentication, but it allows the externally hosted code to use the HTTP API without needing to be served from the same web-server.
* `initialize` does some basic jQuery click handler wireup for button handlers (TODO: implement a simple convention based wireup like Caliburn.Micro, and probably Durandal)
* The `pageinit` and `pagebeforeshow` events are [jQuery Mobile Events](http://jquerymobile.com/demos/1.2.0/docs/api/events.html) that respond to those virtual events for the given pages.
* The `@on "assetCreated", (that, asset) -> ...` and other one utilize [Backbone.Events](http://backbonejs.org/#Events) for simple, custom "publish/subcribe" type notification. In this case, the subscribing code will modify the List page when a Request object is created or modified. We'll see later how these events are published in the ajax callback handlers.
* *Note*: at the very end of the script is ` _.extend VersionOneAssetEditor::, Backbone.Events`. This uses underscore.js's extension function to mixin Backbone.Events into the VersionOneAssetEditor class. I suppose I could have used that for my hand-rolled mixin above.

```coffeescript
define ["backbone", "underscore", "toastr", "jquery", "jquery.mobile", "jsrender"], (Backbone, _, toastr, $) ->
  
  # logging, etc omitted
  
  class VersionOneAssetEditor
    constructor: (options) ->          
      continueSettingOptions = =>
        options.whereParamsForProjectScope =
          acceptFormat: contentType
          sel: ""
        options.queryOpts = acceptFormat: contentType
        options.contentType = contentType      
        for key of options
          @[key] = options[key]      
        @initialize()
      
      contentType = "haljson"
      debugEnabled = options.showDebug
      
      if options.serviceGateway
        $.ajax(options.serviceGateway).done((data) ->
          options.headers = data
          continueSettingOptions()
        ).fail (ex) ->
          error "Failed to get setup data. The URL used was: " + options.serviceGateway
          log ex
      else
        options.headers = Authorization: "Basic " + btoa(options.versionOneAuth)
        continueSettingOptions()
        
    initialize: ->
      @requestorName = ""
      @refreshFieldSet "default"
      
      $(".new").click =>
        @newAsset()

      selectFields = []
      @enumFields (key, field) ->        
        # TODO: hard-coded
        selectFields.push key if key isnt "Description" and field.sel isnt false

      @selectFields = selectFields
      $("#list").live "pageinit", @configureListPage

      $("#list").live "pagebeforeshow", =>
        @listFetchIfNotLoaded()
      
      $("#projectsPage").live "pagebeforeshow", =>
        @setTitle "Projects"

      @on "assetCreated", (that, asset) ->
        success "New item created"
        that._normalizeIdWithoutMoment asset
        that._normalizeHrefWithoutMoment asset
        that.listItemPrepend asset

      @on "assetUpdated", (that, asset) ->
        success "Save successful"
        that._normalizeIdWithoutMoment asset
        that._normalizeHrefWithoutMoment asset
        that.listItemReplace asset

      @configureProjectSearch()
      @toggleNewOrEdit "new"
```


##
```coffeescript
    refreshFormModel: ->
      @assetFormModel = Backbone.Model.extend({schema: @getFormFields()})

    listFetchIfNotLoaded: ->
      @loadRequests() unless @_listLoaded

    configureProjectSearch: ->
      searchTerm = null
      ajaxRequest = null
      projectSearch = $("#projectSearch")
      projectSearch.pressEnter (e) =>
        target = $(e.currentTarget)
        return if searchTerm is target.val()
        searchTerm = target.val()
        return if searchTerm.length < 4
        $.mobile.loading('show')
        ajaxRequest.abort() if ajaxRequest
        assetName = "Scope"
        url = @getAssetUrl(assetName) + "&" + $.param(
          sel: "Name"
          page: "100,0"
          find: "'" + searchTerm + "'"
          findin: "Name"
        )
        request = @createRequest(url: url)
        projects = $("#projects")
        ajaxRequest = $.ajax(request).done((data) =>
          ajaxRequest = null
          projects = $("#projects").empty()
          for val in data
            @projectItemAppend val
          projects.listview "refresh"
          $.mobile.loading('hide')
        ).fail(@_ajaxFail)

    configureListPage: ->
      assets = $("#assets")
      assets.empty()
      assets.listview()
      @_listLoaded = false

    setProject: (projectIdref) ->
      @projectIdref = projectIdref
      @refreshFieldSet projectIdref
      #this.configureListPage();
      @_listLoaded = false
```
# jQuery Promises for deferred loading
# VersionOne API with JSON examples

``` 

    loadRequests: (projectIdref) ->
      @_listLoaded = true
      if not projectIdref?
        projectIdref = @projectIdref
      else
        @setProject projectIdref
      url = @getAssetUrl(@assetName) + "&" + $.param(
        where: "Scope='" + projectIdref + "'"
        sel: "Name,RequestedBy"
        page: "75,0" # TODO: temporary... until real paging support
        sort: "-ChangeDate"
      )
      request = @createRequest(url: url)
      assets = $("#assets")
      assets.empty()
      $.ajax(request).done((data) =>
        info "Found " + data.length + " requests"
        for item, i in data
          @listAppend item
        assets.listview "refresh"
      ).fail @_ajaxFail
      @changePage "#list"

    refreshFieldSet: (fieldSetName) ->
      if @formFields[fieldSetName]?
        @fieldSetName = fieldSetName
      else
        @fieldSetName = "default"
      @refreshFormModel()

    getFormFields: ->
      return @formFields[@fieldSetName]

    getFormFieldsForSelectQuery: ->
      fields = []
      @enumFields (key) ->
        fields.push key
      fields = fields.join(",")
      fieldsClause = $.param(sel: fields)
      return fieldsClause

    listAppend: (item) ->
      assets = $("#assets")
      templ = @listItemFormat(item)
      assets.append templ

    listItemFormat: (item) ->
      templ = $("<li></li>")
      templ.html $("#assetItemTemplate").render(item)
      templ.children(".assetItem").bind "click", (e) =>        
        target = $(e.currentTarget)
        href = target.attr("data-href")
        @editAsset target.attr("data-href")
      return templ

    projectItemAppend: (item) ->
      projects = $("#projects")
      templ = @projectItemFormat(item)
      projects.append templ

    projectItemFormat: (item) ->
      templ = $("<li></li>")
      templ.html $("#projectItemTemplate").render(item)
      templ.children(".projectItem").bind "click", (e) =>
        target = $(e.currentTarget)        
        idref = target.attr("data-idref")
        name = target.attr("data-name")
        @setTitle name
        @setProject idref
        if @projectListClickTarget is "new"
          @newAsset()
        else
          @loadRequests()
      return templ

    setTitle: (title) ->
      $(".title").text ": " + title

    listItemPrepend: (item) ->
      templ = @listItemFormat(item)
      assets = $("#assets")
      assets.prepend templ
      assets.listview "refresh"

    _normalizeIdWithoutMoment: (item) ->
      id = item._links.self.id
      id = id.split(":")
      id.pop() if id.length is 3
      id = id.join(":")
      item._links.self.id = id

    _normalizeHrefWithoutMoment: (item) ->
      href = item._links.self.href
      if href.match(/\D\/\d*?\/\d*$/)
        href = href.split("/")
        href.pop()
        href = href.join("/")
        item._links.self.href = href

    listItemReplace: (item) ->    
      # Thanks to Moments:
      id = item._links.self.id
      templ = @listItemFormat(item)
      assets = $("#assets")
      assets.find("a[data-assetid='" + id + "']").each ->
        listItem = $(this)      
        #var newItem = @listItemFormat(item);
        listItem.closest("li").replaceWith templ
      assets.listview "refresh"
```
newAsset

```coffeescript
    newAsset: (modelData, href) ->
      @configSelectLists().done =>
        asset = null
        if modelData?        
          asset = new @assetFormModel(modelData)
        else
          asset = new @assetFormModel()
        @asset = asset
        form = new Backbone.Form(model: asset).render()
        @form = form
        $("#fields").html form.el
        if modelData?
          @toggleNewOrEdit "edit", href
        else
          @toggleNewOrEdit "new"
        @changePage "#detail"
        @resetForm() unless modelData
        $("#detail").trigger "create"
```
# How Backbone Forms and its Schema / Model approach works
# Relationships fetching

```coffeescript
    configSelectLists: ->    
      # Setup the data within select lists
      # TODO: this should not happen on EVERY new click.
      promise = new $.Deferred()
      ajaxRequests = []
      model = new @assetFormModel().schema
      selectLists = []
      for key, value of model
        selectLists.push value if value.options.length < 1 if value.type is "Select"

      for field in selectLists
        assetName = field.editorAttrs["data-assetName"]
        fields = field.formFields
        fields = ["Name"] if not fields? or fields.length is 0
        url = @service + assetName + "?" + $.param(@queryOpts) + "&" + $.param(
          sel: fields.join(",")
          sort: "Order"
        )
        request = @createRequest(
          url: url
          type: "GET"
        )
        ajaxRequest = $.ajax(request).done((data) =>
          if data.length > 0
            for option in data
              field.options.push
                val: option._links.self.id
                label: option.Name
          else
            @debug "No results for query: " + url
        ).fail(@_ajaxFail)
        ajaxRequests.push ajaxRequest

      return promise if @resolveIfEmpty(promise, ajaxRequests)
      
      @resolveWhenAllDone promise, ajaxRequests
      
      return promise

    resolveIfEmpty: (promise, ajaxRequests) ->
      if ajaxRequests.length < 1
        promise.resolve()
        return true
      return false

    resolveWhenAllDone: (promise, ajaxRequests) ->
      $.when.apply($, ajaxRequests).then ->
        promise.resolve()
```

Console-play with the forms dynamically
editAsset

```coffeescript
    editAsset: (href) ->
      fields = @getFormFields()
      
      url = @host + href + "?" + $.param(@queryOpts)
      fieldsClause = @getFormFieldsForSelectQuery()
      url += "&" + fieldsClause

      asset = @createFetchModel url

      asset.exec().done(=>
        modelData = {}
        model = new @assetFormModel().schema
        links = asset.get('_links')
        for key of model
          value = asset.get(key)
          if value?            
            if fields[key].type == 'Date'
              value = new Date(Date.parse(value))
            modelData[key] = value
          else
            rel = links[key]
            continue if not rel?
            val = links[key]
            if val? and val.length > 0
              val = val[0]
              id = val.idref
              modelData[key] = id
        @newAsset modelData, href
      ).fail @_ajaxFail

    toggleNewOrEdit: (type, href) ->
      save = $("#save")
      saveAndNew = $("#saveAndNew")
      if type is "new"
        save.unbind "click"
        save.bind "click", (evt) =>
          evt.preventDefault()
          @createAsset @assetName, (asset) =>          
            # refresh
            @editAsset asset._links.self.href
        saveAndNew.unbind "click"
        saveAndNew.bind "click", (evt) =>
          evt.preventDefault()
          @createAsset @assetName, =>
            @newAsset()          
            # Hardcoded:
            $("#Name").focus()
      else if type is "edit"
        save.unbind "click"
        save.bind "click", (e) =>
          e.preventDefault()
          @updateAsset href
        saveAndNew.unbind "click"
        saveAndNew.bind "click", (e) =>
          e.preventDefault()
          @updateAsset href, =>
            @newAsset()

    createRequest: (options) ->
      options.headers = @headers  unless @serviceGateway
      return options

    createFetchModel: (url) ->
      options = {}
      options.headers = @headers unless @serviceGateway
      props = 
        url: url
        exec: ->
          return @fetch(options)

      fetchModel = Backbone.Model.extend(props)

      return new fetchModel()

    createAsset: (assetName, callback) ->
      url = @getAssetUrl(assetName)
      @saveAsset url, "assetCreated", callback

    updateAsset: (href, callback) ->
      url = @host + href + "?" + $.param(@queryOpts)
      @saveAsset url, "assetUpdated", callback

    saveAsset: (url, eventType, callback) ->
      validations = @form.validate()
      if validations?
        error "Please review the form for errors", null,
          positionClass: "toast-bottom-right"
        return
      dto = @createDto()
      debug "Dto:"
      debug dto
      request = @createRequest(
        url: url
        type: "POST"
        data: JSON.stringify(dto)
        contentType: @contentType
      )
      $.ajax(request).done((data) =>
        @trigger eventType, @, data
        callback data if callback
      ).fail @_ajaxFail

    createDto: ->
      dto = @form.getValue()

      # TODO: hard-coded for test
      dto._links = Scope:
        idref: @projectIdref

      $("#fields select").each ->
        el = $(this)
        id = el.attr("name")
        val = el.val()
        relationAssetName = el.attr("data-rel")
        if relationAssetName
          dto._links[relationAssetName] = idref: val
          delete dto[id]
      return dto

    getAssetUrl: (assetName) ->
      url = @service + assetName + "?" + $.param(@queryOpts)
      return url

    changePage: (page) ->
      $.mobile.changePage page

    resetForm: ->
      @enumFields (key, field) ->
        $("[name='" + key + "']").each ->
          unless field.type is "select"
            $(this).val ""
            $(this).textinput()    
      '''
      sel = $("[name='Priority']")
      sel.selectmenu()
      sel.val "RequestPriority:167"
      sel.selectmenu "refresh"
      '''

    enumFields: (callback) ->
      for key, field of @getFormFields()
        callback key, field

    findField: (fieldName) ->
      fields = [null]
      index = 0
      addField = (key, field) ->
        fields[index++] = field if key is fieldName
      @enumFields addField
      return fields[0]

  debugEnabled = false
  _.extend VersionOneAssetEditor::, Backbone.Events

  return VersionOneAssetEditor
```

