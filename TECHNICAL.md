This set of walkthroughs demonstrates and describes the technical implementation of the VersionOne Requestor tool.

# Requestor Tool Goals

The Requestor Tool implementation serves multiple goals:

* Provide a code sample that customers and developers can use, both to solve a common problem, and to learn about using the VersionOne API with simple, existing open source technologies
* Serve as a valuable testing ground for improved and simplified JSON support in the VersionOne API
* Spur conversations and ideas related to VersionOne and the "mobile web"

# Article Sections

1. Open Source Technologies Overview
2. Hands on Demo with JSON Request & Response Inspection
3. Backbone Forms and Model Binding Exercise
4. Modular and Mobile Architecture Details

# 1. Open Source Technologies Overview

**Note**: Skip this part if you just want to try the hands on demos and exercises first. But, please refer bcak to it later to see if you can help with suggestions regarding the areas for improvement. Thanks!

Just as the VersionOne API and Platform are open source, so are the technologies used in the Requestor tool. All of these are popular tools, many already in use by the VersionOne core team. Others are "up and coming", or tried and true libraries and frameworks in the web development and open source communities.

## Technology list
* [VersionOne.SDK.Experimental Api Input / Output Translators](http://www.github.com/VersionOne/VersionOne.SDK.Experimental) -- converts JSON (HAL compliant) to V1 XML on inbound, and reverse on outbound
* [RequireJS](http://requirejs.org) -- module loading
* [Backbone Forms](https://github.com/powmedia/backbone-forms) -- dynamically creates the HTML form based on a lightweight "schema" defined in JS
* [jQuery Mobile](http://www.jquerymobile.com) -- mobile-friendly HTML5 framework
* [Backbone.js](http://backbonejs.org) -- only utilizing Backbone.Events and models at a rudimentary level right now
* [jsRender](https://github.com/BorisMoore/jsrender) -- jQuery Templates successor
* [toastr](https://github.com/CodeSeven/toastr) -- simple "toast" status messages
* [CoffeeScript](http://coffeescript.org/) -- you may sip it, or sink it, that's your taster's choice. Me? I drink it.

## Areas for Possible Improvement

Before even starting to examine code, let me say where I already believe improvements can be made so that you can keep these in mind, along with any other ideas you generate:

* Break up the VersionOneAssetEditor class into a few smaller parts
* Reduce use of callbacks (already using Backbone.Events in a couple key places) and jQuery Promises
* Better use of Backbone events, models, collections, views, routes, etc?
* Possible simplification with the YAML query support Joe Koberg has created for the multiple dropdown lists -- which are populated from custom field values specific to a customer's project
* Explore use of Backbone.sync + localStorage. [See this project](http://documentcloud.github.com/backbone/docs/backbone-localstorage.html) -- This would be for people able to create requests "off line", saved to localStorage, then put them into VersionOne when they are ready to, or when they have a network connection
* Throw in some "Infinite Genericization" of the VersionOneAssetEditor -- something that is entirely model-driven and can edit any type of asset based on its Meta definition
* Use of Jade for templates -- see this open-source project I'm working on for an example: [OpenEpi Mobile](http://www.github.com/JogoShugh/OpenEpi.com.jQueryMobile)
* Replace underscore with [lo-dash](http://lodash.com/) for performance? What about [zepto.js](http://zeptojs.com/) instead of jQuery?

# 2. Hands on Demo with JSON Request & Response Inspection

At the heart of this app is [JSON](http://www.json.org/). VersionOne does not yet natively support the JSON format that we use in this app. But, the DLLs from VersionOne.SDK.Experimental add that support in an unobtrusive way with a simple `Web.config` change.

Before looking at the code, let's step through the events using Chrome's Developer Tools (F12 brings them up) to examine the HTTP requests and responses.

## 1. Search for projects by name

* First, using Chrome, open the Developer Tools by hitting `F12`, and select the Network tab
* Open `http://localhost/v1requestor/index.html`
* Type `system` into the text box
* Hit enter

Now, in the Chrome Developer Tools' Network tab, we can inspect the request and response:

### Request generated

#### URL

```
http://localhost/VersionOne.Web/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name
```

Various VersionOne API parameters comprise this request:

* `sel=Name` -- return only the *Name* attribute from the remote resource
* `page=100,0` -- return 100 items max, starting at page 0
* `find='system'` -- search for the word `system`
* `findin=Name` -- search for `find` within the `Name` attribute only

#### Headers

A look at the full headers:

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

Notice the Authorization header, which contains the Base64 encoded credentials. This string gets created using Chrome's `btoa` function, but if `options.serviceGateway` is defined, it will get that string from the gateway instead of hard-coding the credentials in the script. (I'm not pretending that this is secure, it's just for covenience right now)

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

* Still with the Chrome Developer Tools and Network tab open, click the 'System (All Projeccts)` result
* Click the `List` button to fetch the Request list

### Request URL generated

```text
http://localhost/VersionOne.Web/rest-1.v1/Data/Request?acceptFormat=haljson&where=Scope%3D'Scope%3A0'&sel=Name%2CRequestedBy&page=75%2C0&sort=-ChangeDate
```

Again, various VersionOne API parameters comprise this URL:

* `where=Scope='Scope:0'` -- return a Scope asset with the given id
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

The VersionOne API parameters breakdown:

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
**Note**: Because `Priority` is a Relation, there's no need to send the `Priority.Name`. Instead, it just sends a `_link` relation with the idref.

*TODO* perhaps it would be more RESTful to require sending the URL as an `href` param instead of the shorter `idref`. Thoughts?

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

Important in this response:

* It contains the same fields that we sent it, and only those fields
* The `_links.self.href` and `_links.self.id` properties contain the asset's `Moment`, which is a specific, very precise address of the asset. Since all asset changes are retained, this provides the exact location for this *version* of the asset. Note that if we now request the asset without the moment, the asset will still have the same state. However, someone else could change it before we do that. 
In that case, we can always request this specific moment of the asset's state by using the moment-containing URL or id.
* TODO: I am not sure why it returned the Scope as a relation.

# 3. Backbone Forms and Model Binding Exercise

Backbone Forms is an open source library for Backbone.js that makes creating model-bound HTML forms dead simple. This exercise will show you how Backbone Forms is used to make the Request editor and to simplify, using Backbone models, the request / response interaction we just demonstrated.

## Simple Backbone Forms Example

For a quick overview of what Backbone Forms does, take a look at this example from the project's documentation:

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

For a better understanding of the library, take a look at [Backbone Forms on Github](https://github.com/powmedia/backbone-forms).

## Requestor Tool Configuration for Backbone Forms

So, how do we use Backbone Forms in the Requestor?

### Form specification in fields.coffee

The file `fields.coffee` contains the set of fields and their datatype, plus a few other attributes. For scalar types, it's very simple. See the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for possible values of the `type` attribute for form element types.

By default, a project will use the fields specified in the `defuault` property. To override that set for a specific project, simply add another property the scope id, like `Scope:173519`.

Here's how the form we saw in part one gets specified:

```coffeescript
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
```

* The left-most property name must match an asset's attribute name
* `title` -- will be used as the description label on the form
* `type` -- specifies what kind of form element to use, defaulting to simple text box
* `assetName` -- specifies the VersionOne asset type for relations on an asset
* `autofocus` -- specifies that a field should be automatically focused on load 
* `optional` -- when true, allows an empty value for the field
 
**Note**: If you read the Backbone Forms documentation, you'll notice that `autofocus`, `optional`, and, of course `assetName` are not part of its API. That's because we pre-process these properties before passing this into Backbone Forms. We'll go into that in more detail in another section.

## 1. Generate a Simple JSON Object from the Form

This step demonstrates how Backbone Forms produces simple, clean JSON objects (POJSOs?) from its fields.

* Open Chrome's Console by hitting `F12` and select the Console tab
* Load the Requestor tool
* Follow the same steps from part one, up to step 3, to load an existing Request for edit
* Now, in the Chrome Console tab, type: `JSON.stringify( v1RequestForm.getValue() )` and hit enter

You should see something like this:

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
  "Priority": "RequestPriority:167"
}
```
**Note**: `v1RequestForm`, along with `v1AssetEditor`, are variables set into the global `window` object in `scripts/main.js` in a Backbone.Events based event handler, which we'll cover at the end of this exercise.

## 2. Modify the Form using the Model

Given you have just completed the first step above, do this:

* In the Console, type: `v1RequestForm.setValue('RequestedBy', 'Your Name')`
* Look at the RequestedBy field of the form. It should now say `Your Name`!
* If you now type `v1RequestForm.getValue('RequestedBy')`, you'll see `Your Name`

## 3. Generate a VersionOne API-compatible JSON DTO using the Editor 

Finally, given you've at least done step one above:

* In the Console, type `JSON.stringify( v1RequestEditor.createDto() )`. You should see something like:

```json
{
  "RequestedBy": "Your Name",
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

This contains the `_links` property, which specifies the relation items necessary for the VersionOne API to properly process the request.

## 4. Create a new event handler to stringify the asset *"on update"*

If you change the `RequestedBy` or `Name` (Title on screen) fields, then click the `List` button, you'll notice that these changes are already reflected in the list. But, you don't see any additional traffic on the Network tab when you do this. That's because we're using Backbone.Events to create our own event handler, which subscribes to a custom event called `assetUpdated`. 

Here's how we do that way back inside of `VersionOneAssetEditor.constructor`:

```coffeescript
@on "assetUpdated", (assetEditor, asset) ->
	success "Save successful"
	assetEditor._normalizeIdWithoutMoment asset
	assetEditor._normalizeHrefWithoutMoment asset
	assetEditor.listItemReplace asset
```

Remember the JSON response body from part one in step 4, the one with the moments in it? If not, here's a snippet from that:

```json
  "_links": {
    "self": {
      "href": "/VersionOne.Web/rest-1.v1/Data/Request/2094/2745",
      "id": "Request:2094:2745"
    },
```

The *normalize* functions simply remove the moment number from the `id` and `href` values in the `_links.self` object. This is important because we need to load the latest, momentless version of the asset on click.

Now, add your own, additional event handler like this:

* Complete step one above, then:
* From the Console, type: `v1AssetEditor.on('assetUpdated', function(asset) { console.log( JSON.stringify(asset) ); } )` and hit enter
* Change the Deecription field on the form to `Backbone.Events is Awesome!` and hit `Save`
* You should see this in the Console:

```json
{
  "Description": "Backbone.Events is Awesome!",
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
