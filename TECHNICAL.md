This set of walkthroughs demonstrates and describes the technical implementation of the VersionOne Requestor tool.

# Requestor Tool Goals

The Requestor Tool implementation serves multiple goals:

* Provide a code sample that customers and developers can use, both to solve a common problem, and to learn about using the VersionOne API with simple, existing open source technologies
* Serve as a valuable testing ground for improved and simplified JSON support in the VersionOne API
* Spur conversations and ideas related to VersionOne and the "mobile web"

# Article Sections

1. Open Source Technologies Overview
 - Technology List
 - Areas for Possible Improvement
2. Hands on Demo with JSON HTTP Request & HTTP Response Inspection
 - Search for Projects by Name
 - Select a Project and Fetch its Request Assets
 - Select a Request to Edit
 - Modify the Request and Save
3. Exercise: Build a Simple "Barebones Story Editor" with HTML and jQuery
 - Get Familiar with JSFiddle
 - Try out a GET Story HTTP request
 - Try out a GET Story PUT request
 - Create a Basic HTML Form to Edit a Story
 - Wire Up Some jQuery Event Handlers to Submit the Story
 - Conclusion: There's Got to be a Better Way!
4. Exercise: Giving Some Backbone to the Barebones Story Editor
 - Replace the Handmade HTML Form with Backbone Forms
 - Replace `createStoryDto` with Backbone Forms' `getValue()` function
5. Hands on Demo: Requestor Backbone Forms and Playing with Model Binding
 - Simple Backbone Forms Example
 - Requestor Tool Configuration for Backbone Forms
 - Generate a Simple JSON Object from the Form
 - Modify the Form using the Backbone Model in the Developer Console
 - Generate a VersionOne API-compatible JSON DTO in the Developer Console
 - Create a new Event Handler to Stringify the Request Asset "on update"
4. Modular and Mobile Architecture Details
 - TODO

# 1. Open Source Technologies Overview

**Note**: Skip this part if you just want to try the hands on demos and exercises first. The first demo is of the Requestor tool itself, but the first exercise is actually a hand-crafted Story editor which will give you a better understanding of the REST API and how to use it with jQuery's AJAX support. The second exercise shows how the other, more advanced, open source libraries are used to make the Requestor tool.

Even if you do skip straight into those, please refer back to this section later to see if you can help with suggestions regarding the areas for improvement. Thanks!

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

# 2. Hands on Demo with JSON HTTP Request & HTTP Response Inspection

At the heart of this app is [JSON](http://www.json.org/). VersionOne does not yet natively support the JSON format that we use in this app. But, the DLLs from VersionOne.SDK.Experimental add that support in an unobtrusive way with a simple `Web.config` change.

Before looking at the code, let's step through the events using Chrome's Developer Tools (F12 brings them up) to examine the HTTP requests and responses.

## 1. Search for projects by name

* First, using Chrome, open the Developer Tools by hitting `F12`, and select the Network tab
* Open `http://eval.versionone.net/platformtest/v1requestor/index.html`
* Type `system` into the text box
* Hit enter

Now, in the Chrome Developer Tools' Network tab, we can inspect the HTTP request and HTTP response:

### HTTP Request generated

#### URL

```
http://eval.versionone.net/platformtest/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name
```

Various VersionOne API parameters comprise this HTTP request:

* `sel=Name` -- return only the *Name* attribute from the remote resource
* `page=100,0` -- return 100 items max, starting at page 0
* `find='system'` -- search for the word `system`
* `findin=Name` -- search for `find` within the `Name` attribute only

#### Headers

A look at the full headers:

```text
GET /platformtest/rest-1.v1/Data/Scope?acceptFormat=haljson&sel=Name&page=100%2C0&find='system'&findin=Name HTTP/1.1
Host: eval.versionone.net
Connection: keep-alive
Authorization: Basic YWRtaW46YWRtaW4=
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11
Accept: */*
Referer: http://eval.versionone.net/platformtest/v1requestor/index.html
Accept-Encoding: gzip,deflate,sdch
Accept-Language: en-US,en;q=0.8
Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.3
```

Notice the Authorization header, which contains the Base64 encoded credentials. This string gets created using Chrome's `btoa` function, but if `options.serviceGateway` is defined, it will get that string from the gateway instead of hard-coding the credentials in the script. (I'm not pretending that this is secure, it's just for covenience right now)

### HTTP Response received

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

### HTTP Request URL generated

```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request?acceptFormat=haljson&where=Scope%3D'Scope%3A0'&sel=Name%2CRequestedBy&page=75%2C0&sort=-ChangeDate
```

Again, various VersionOne API parameters comprise this URL:

* `where=Scope='Scope:0'` -- return a Scope asset with the given id
* `sel=Name,RequestedBy` -- return the Name and RequestedBy attributes of this Scope asset
* `page=75,0` -- return 75 items max, starting at page 0
* `sort=-ChangeDate` -- sort the results in desending order by the ChangeDate attribute

### HTTP Response received

The HTTP response contains an array of JSON objects that contain only the Name and RequestedBy attributes. This then gets used to populate the listview.

```json
[
  {
    "Name": "Date fields should look better",
    "RequestedBy": "Blaine Stussy",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1152",
        "id": "Request:1152"
      }
    }
  },
  {
    "Name": "As an API Adopter, I can deploy the Requestor Tool easily",
    "RequestedBy": "Ian Buchanan",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1151",
        "id": "Request:1151"
      }
    }
  },
  {
    "Name": "Add the Custom_Team custom field to the Request form",
    "RequestedBy": "Blaine Stussy",
    "_links": {
      "self": {
        "href": "/platformtest/rest-1.v1/Data/Request/1150",
        "id": "Request:1150"
      }
    }
  }
]
```

## 3. Select a Request to edit

* Now click the `Add the Custom_Team custom field to the Request form` request

### HTTP Request URL generated

```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request/1150?acceptFormat=haljson&sel=RequestedBy%2CName%2CDescription%2CPriority
```

The VersionOne API parameters breakdown:

* `/Data/Request/1150` -- the specific URL that uniquely identifies this Scope asset
* `sel=RequestedBy,Name,Description,Priority` -- return just these four attributes

### HTTP Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field to the Request form for the CapEx project, and only the CapEx project",
  "Priority.Name": "High",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150",
      "id": "Request:1150"
    },
    "Priority": [
      {
        "href": "/platformtest/rest-1.v1/Data/RequestPriority/169",
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

### HTTP Request generated

#### URL
```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Request/1150?acceptFormat=haljson
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

### HTTP Response received

This time, we have several more fields, including the `Priority`, which is itself a `Relation`. By default, the VersionOne API projects the `Priority.Name` value into the result as well.

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Please add the Custom_Team field, between the Description and Priority fields, to the Request form for the CapEx project, and only for the CapEx project",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150/1321",
      "id": "Request:1150:1321"
    },
    "Scope": [
      {
        "href": "/platformtest/rest-1.v1/Data/Scope/0",
        "idref": "Scope:0"
      }
    ],
    "Priority": [
      {
        "href": "/platformtest/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ]
  }
}
```

Important in this HTTP response:

* It contains the same fields that we sent it, and only those fields
* The `_links.self.href` and `_links.self.id` properties contain the asset's `Moment`, which is a specific, very precise address of the asset. Since all asset changes are retained, this provides the exact location for this *version* of the asset. Note that if we now request the asset without the moment, the asset will still have the same state. However, someone else could change it before we do that. 
In that case, we can always request this specific moment of the asset's state by using the moment-containing URL or id.
* TODO: I am not sure why it returned the Scope as a relation.

# 3. Exercise: Build a Simple Story Editor by Hand and Use jQuery for AJAX
 
This exercise will take you through building a very rudimentary Story editor using standard HTML and JavaScript. 
The only third-party library it will depend on is jQuery, and only for simple event handling and AJAX support.

## Get Familiar with JSFiddle

We're going to use JSFiddle to build our form. So, do this:

* Open a new window or tab in Chrome and navigate to [http://www.JSFiddle.net](http://www.jsFiddle.net)
* From the left side, under `Choose Framework`, leave `onLoad`, and select `jQuery` (Any version above 1.6)
* On the right, you'll see four panels: `HTML, JavaScript, CSS, and Result`
* We'll only use the JavaScript panel for now, so type this into it and then press `Run`:

```javascript
var host = "http://eval.versionone.net"; // Remote web server root
var service = host + "/platformtest/rest-1.v1/Data/" // Path to the REST service
var assetQueryPath = "Scope/0" // Location of an Asset to fetch
var headers = { 
  Authorization: "Basic " + btoa("admin:admin"), // Necessary to authenticate, since we won't have a login cookie from JSFiddle
  Accept: 'haljson' // The format that we want the response in. Without this, we get XML.
};

var settings = { // Parameters jQuery's ajax function needs to make our GET request
  url: service + assetQueryPath,
  headers: headers,
  dataType: 'json' // Hint to jQuery, that the response should be JSON data
};

$.ajax(settings)
  .done(function(data) { // Callback for when the server responds properly  
    beautifulJson = JSON.stringify(data, null, 4); // Pretty print our JSON with indentation        
    $("body").html('<pre>' + beautifulJson + '</pre>'); // Tack it into the DOM
    notAsPrettyJson = JSON.stringify(data);
    console.log(notAsPrettyJson.length);
  })
  .fail(function(jqXHR) { // Callback for when the server "blows up". Change assetQueryPath to "SSSSScope/0" to see!
    $('body').html(jqXHR.responseText);
  });
```

Live: http://jsfiddle.net/2nfqa/1/

For illustration purposes, try the same code, but without asking for JSON. This time, you'll get the raw XML format:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetQueryPath = "Scope/0";
var headers = { 
  Authorization: "Basic " + btoa("admin:admin")
};

var settings = {
  url: service + assetQueryPath,
  headers: headers,
  dataType: 'text'
};

$.ajax(settings)
  .done(function(data) {    
    $("body").text(data);
    console.log(data.length);
  })
  .fail(function(jqXHR) {
    $('body').html(jqXHR.responseText);
  });
```

Live: http://jsfiddle.net/cVSHD/

## Extend our JSFiddle Example with Basic HTML

http://jsfiddle.net/HtyNS/1/
Again with JSFiddle, do this: 

* Open a new window or tab in Chrome and navigate to [http://www.JSFiddle.net](http://www.jsFiddle.net)
* Select 'jQuery' as a the framework on the left side.
* Next, in the HTML panel on the right, type or paste this:

```html
<div id="error">
  <h1>Error During AJAX Call:</h1>
  <br />
  <hr />
  <br />
  <p id="errorMessage">
  </p> 
</div>

<div id="success">
  <h1>Now, that's <b>beautiful JSON</b>:</h1>
  <br />
  <pre id="output"></pre>
  <br />
  <a id="link"></a>
  <br/>
  <br/>
  Right click and select <code>Open link in new tab</code> to play with this request some more.    
  </p>
</div>
```

* In the JavaScript panel, add this:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/"
var assetQueryPath = "Scope/0?sel=Name,Owner.Name"
var headers = {
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'  
};

var settings = {
  url: service + assetQueryPath,
  headers: headers,
  dataType: 'json'
};

$.ajax(settings)
  .done(function(data) {
    beautifulJson = JSON.stringify(data, null, 4);
    
    link = settings.url + '&acceptFormat=haljson';
    
    $('#link')
      .attr('href', link)
      .text(link);
    
    $('#error').hide();
    
    $('#output').text(beautifulJson);
    $('#success')    
      .css('visibility', 'visible')
      .fadeIn();
  })
  .fail(function(jqXHR) {
    $('#success').hide();
    $('#errorMessage').html(jqXHR.responseText);
    $('#error')
      .css('visibility', 'visible')
      .fadeIn();
  });
```

* And, for good measure, add this to the CSS panel:

```css
body {
  margin: 10px
}

#error {
  background: lightyellow;
  border: 2px solid firebrick;
  padding: 10px;
  visibility: hidden;  
}

#success {
  background: whitesmoke;
  border: 2px solid firebrick;
  padding: 10px;
  visibility: hidden;
}

#output, #errorMessage {
  font-size: 80%;  
  border: 1px solid darkgray;
  background: linen;
  padding: 6px;
}
```

## Issue a Barebones GET Story HTTP Request

Now that we're comfortable with JSFiddle, let's start building our Barebones Story Editor!

* Try this simple query in the web browser's address bar:

```text
http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1154?acceptFormat=haljson&sel=Name,Description,Estimate
```

* You should see some JSON similar to this:

```json
{
  "Name": "Tutorial Story",
  "Description": "<p>Sample tutorial story</p>",
  "Estimate": "",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Story/1154",
      "id": "Story:1154"
    }
  }
}
```

Our Barebones Story Editor will feature *just* Name, Description, and Estimate, 
so this query is enough for us to base our GET HTTP request on.

## Issue a Barebones POST Story HTTP Request

* Now, fire up another JSFiddle tab, and, after selecting `jQuery` as your framework, add this code to the JavaScript panel and run it:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetPath = "Story/1154";
var headers = { 
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};

var storyDto = {
  Description: prompt('Enter a description', 'Changing description at time of ' + $.now()),
  Estimate: prompt('Enter an estimate of 1 to 5', '2')
};

var settings = {	
  url: service + assetPath,
  type: 'POST',
  data: JSON.stringify(storyDto),
  dataType: 'json',
  contentType: 'haljson',
  headers: headers
};

$.ajax(settings)
  .done(function(data) {
    beautifulJson = JSON.stringify(data, null, 4);
    $("body").html('<pre>' + beautifulJson + '</pre>');
  })
  .fail(function(jqXHR) {
    $('body').html(jqXHR.responseText);
  });
```

This time, we pass a few more settings to jQuery, such as the `POST` HTTP method, and, of course, 
a stringified DTO object with two properties that will overwrite those properties on the asset. 
Notice also that the response from the server contains just those two attributes.

## Create the Barebones Story Editor HTML Form

Having explored all the major client-server interactions, let's now 
build the "simplest thing that could possibly work", to be agile, to edit the Story.

* Select `jQuery` as the framework from the left, then enter this into the HTML panel:

```html
<html>
  	<head>
  		<title>Barebones Story Editor</title>
  	</head>
	<body>
		<h1>Barebones Story Editor</h1>
		<br/>
        <label for="StoryId">Enter a Story ID: </label><input type="text" id="StoryId" /> <input type="button" id="storyGet" value="Load Story" />        
        <div id="editor">
			<form id="editorForm">
				<label for="Name">Story Name:</label><br />
				<input type="text" id="Name" name="Name">
                <br/>
                <label for="Name">Description:</label><br /> 
                <textarea id="Description" name="Description"></textarea>
                <br/>                  
                <label for="Estimate">Estimate:</label><br />
                <input type="text" id="Estimate" name="Estimate" />
                <br/>				
            </form>
            <input type="button" id="save" value="Save Story" />
		</div>
		<div id="message"></div>
	</body>
</html>
```

* Add this to the CSS panel:

```css
body 
{
	padding: 5px;
  	font-family: sans-serif;
}

#editor
{
  	padding: 10px;
  	border: 1px solid darkblue;
  	background: whitesmoke;
    display: none;
}

label 
{
	color: darkblue;
}

textarea 
{
  height:100px;
}

#message 
{
  margin-top: 5px;
  color: darkgreen;
}
```

* And, to wrap it up, put this into the JavaScript panel then hit run:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetPath = "Story/";
var select = "?sel=Name,Description,Estimate"
var headers = { 
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};

$(function(){
  var storyId = '';
  
  $("#storyGet").click(function(e) {
    storyId = $('#StoryId').val();
	if (storyId == '') 
    {
      return;
    }
    url = service + assetPath + storyId + select
    $.ajax({
      url: url,
      type: 'GET',      
      dataType: 'json',
      headers: headers
    }).done(function(data){
    	bindDtoToForm(data);
        $("#editor").show();
    }).fail(function(jqXHR){
      	alert('Error during get. See console for details.');
      	console.log('Error:');
      	console.log(jqXHR.responseText);
    });
  });
  
  $('#save').click(function(){
    var storyDto = createDtoFromForm("#editorForm input, #editorForm textarea");
    $.ajax({
      	url: service + assetPath + storyId,
		type: 'POST',
  		data: JSON.stringify(storyDto),
  		dataType: 'json',
  		contentType: 'haljson',
  		headers: headers
    }).done(function(data){
      	$('#message').text('Save successful! You can load it in VersionOne and see the results of your labor.');
		console.log(data);
    }).fail(function(jqXHR){
      	alert('Error during save. See console for message.');      
      	console.log('Error on save:');
      	console.log(jqXHR.responseText);     
    });
  });
});

function bindDtoToForm(data) {
  console.log ("data:" + data);
  for (var key in data) {
    console.log(key);
    $("#" + key).val(data[key]);
  }
}

function createDtoFromForm(selector) {
  var dto = {};
  $(selector).each(function() {
    var item = $(this);
    var id = item.attr('id');
    dto[id] = item.val();
  });
  return dto;
}
```

That's it! You now have a complete Barebones Story Editor. Did you notice how easy it was to build up the DTO 
using the `createDtoFromForm` function? Well, it will be even easier than that when we add 
some **Backbone** to this and use **Backbone Forms** next!

http://jsfiddle.net/HtyNS/1/


# 4. Exercise: Giving Some Backbone to the Barebones Story Editor
 
Now that we've created our Barebones Editor by hand, it would be nice if we could make it easier to use and extend, right?

After all, who wants to have to go in to a block of HTML and add a bunch of markup *just because you need another field from your domain to show up*? Not you? Not me, either.

Instead, we'll refactor our code so that all we need to do is change a configuration 

HERE IT IS: http://jsfiddle.net/eGzXV/7/

HTML:
```html
<html>
  	<head>
  		<title>Barebones Story Editor</title>
  	</head>
	<body>
		<h1>Barebones Story Editor</h1>
		<br/>
        <label for="StoryId">Enter a Story ID: </label><input type="text" id="StoryId" /> <input type="button" id="storyGet" value="Load Story" />        
        <div id="editor">
			<form id="editorForm">
              <div id="editorFields"></div>
            </form>
            <input type="button" id="save" value="Save Story" />
		</div>
		<div id="message"></div>
	</body>
</html>

```

JavaScript

```javascript
var urlRoot = 'http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/';

var headers = {
    Authorization: "Basic " + btoa("admin:admin"),
    Accept: 'haljson'
};

var fetchOptions = {
    dataType: 'json',
    headers: headers
};

var saveOptions = {
    contentType: 'haljson',
    patch: true,
    headers: headers
};

var formSchema = {
    Name: {
        help: 'Enter a story name',
        title: 'Story Name',
        validators: ['required']
    },
    Description: {
        title: 'Description',
        help: 'Enter a brief description of the story',
        validators: ['required']
    },
    Estimate: {
        title: 'Estimate',
        help: 'Enter an estimated complexity between 1 and 5'
    }
};

var form = null;

function createForm(model) {
    var settings = {
        schema: formSchema
    };

    function finish() {
        form = new Backbone.Form(settings);
        $('#editorFields').empty();
        $('#editorFields').append(form.render().el);
        $("#editor").fadeIn();
    }
    if (model) {
        model.fetch(fetchOptions).done(function () {
            console.log(model);
            settings.model = model;
            finish();
        });
    } else {
        finish();
    }
}

function bindDtoToForm(data) {
    createForm(data);
}

function createDtoFromForm(selector) {
    return form.getValue();
}

var saveModel = false;
var model = new(Backbone.Model.extend({
    urlRoot: urlRoot,
    url: function () {
        if (saveModel) return this.urlRoot + this.id;
        return this.urlRoot + this.id + '?sel=' + _.keys(formSchema).join(',')
    }
}));


model.id = '';

function storyGet() {
    model.id = $('#StoryId').val();
    console.log(model.id);
    if (model.id == '') {
        return;
    }
    createForm(model);
}

function storySave() {
    Backbone.emulateHTTP = true;
    saveModel = true;
    form.commit();
    model.save(form.getValue(), saveOptions).done(function (data) {
        console.log('Saved!');
        console.log(data);
    });
}

var storyId = '';
$(function () {
    var storyId = '';

    createForm();

    $("#storyGet").click(storyGet);
    $('#save').click(storySave);
});
```

CSS
```
body 
{
	padding: 5px;
  	font-family: sans-serif;
}  

#editor
{
  	padding: 10px;
  	border: 1px solid darkblue;
  	background: whitesmoke;
    display: none;
}

label 
{
	color: darkblue;
}

textarea 
{
  height:100px;
}

#message 
{
  margin-top: 5px;
  color: darkgreen;
}
```

# MetaMorformizer: Into Wild the Blue Yonder!

There's another aspect to the VersionOne API that can take us up to an even higher level of abstraction and mastery.
Right now, you might feel like you're still in a cocoon, like a caterpillar, eager to fly.

With the VersionOne Meta and Localization APIs you can break free. You can undergo metamorphosis!

## VersionOne Meta API

The [VersionOne Meta API](http://community.versionone.com/sdk/Documentation/MetaAPI.aspx) 
allows us to query information about the VersionOne Information Model. Quoting from the main documenatation source:

> The Meta API provides a facility for retrieving information about the VersionOne business objects. 
> This includes getting information about the asset types, attribute definitions, relationships and operations. 

So, here's a URL you can type in your browser's address bar to get the meta information for the `Story` asset type:

```text
http://evel.versionone.net/platformtest/meta.v1/Story?accept=application/json
```

Distilled down to our three stooges, `Name, Description, Estimate`, we have:

```javascript
{
    "Story.Name": {
        "_type": "AttributeDefinition",
        "Name": "Name",
        "Token": "Story.Name",
        "DisplayName": "AttributeDefinition'Name'Story",
        "AttributeType": "Text",
        "IsReadOnly": false,
        "IsRequired": true,
        "IsMultivalue": false,
        "IsCanned": true,
        "IsCustom": false,
        "Base": {
            "href": "/versionone.web/meta.v1/BaseAsset/Name",
            "tokenref": "BaseAsset.Name"
        },
        "OrderByAttribute": {
            "href": "/versionone.web/meta.v1/Story/Name",
            "tokenref": "Story.Name"
        }
    },
    "Story.Description": {
        "_type": "AttributeDefinition",
        "Name": "Description",
        "Token": "Story.Description",
        "DisplayName": "AttributeDefinition'Description'Story",
        "AttributeType": "LongText",
        "IsReadOnly": false,
        "IsRequired": false,
        "IsMultivalue": false,
        "IsCanned": true,
        "IsCustom": false,
        "Base": {
            "href": "/versionone.web/meta.v1/BaseAsset/Description",
            "tokenref": "BaseAsset.Description"
        },
        "OrderByAttribute": {
            "href": "/versionone.web/meta.v1/Story/Description",
            "tokenref": "Story.Description"
        }
    },
    "Story.Estimate": {
        "_type": "AttributeDefinition",
        "Name": "Estimate",
        "Token": "Story.Estimate",
        "DisplayName": "AttributeDefinition'Estimate'Story",
        "AttributeType": "Numeric",
        "IsReadOnly": false,
        "IsRequired": false,
        "IsMultivalue": false,
        "IsCanned": true,
        "IsCustom": false,
        "Base": {
            "href": "/versionone.web/meta.v1/PrimaryWorkitem/Estimate",
            "tokenref": "PrimaryWorkitem.Estimate"
        },
        "OrderByAttribute": {
            "href": "/versionone.web/meta.v1/Story/Estimate",
            "tokenref": "Story.Estimate"
        }
    }
}
```
## VersionOne Localization API

The `Name, Description, Estimate` attributes are all one word identifiers, 
so they can serve as nice titles for fields too, but what if we want to add the `RequestedBy` attribute? 
Do you, as a programmer, want to search and prefix capital letters, after the first character, with a space? 
You might say, "Hey, that should be easy, let me try it out!", like I did:

```javascript
javascript:alert('RequestedByAndEvenMore'.replace(/([A-Z])/g, ' $1').substring(1) == 'Requested By And Even More')
```

http://community.versionone.com/sdk/Documentation/LocalizationAPI.aspx


Notice the property `DisplayName` from above:

```text
AttributeDefinition'Name'Story
```
This value can be passed to the Localization API to get the label for the field title. TODO: finish this


Armed with this, we can now *dynamically create* even the `formSchema` itself, and, what's more, 
we can even dynamically supply the field names on the query string or in a `prompt` dialog.

The HTML has lots of improvements, and some instructional text, plus a hard-coded subset of the possible Story attributes: of 

```html
<html>
    
    <head>
        <title>VersionOne MetaMorformizer Story Editor</title>
    </head>
    
    <body>
        	<h1>VersionOne MetaMorformizer Story Editor</h1>
An intermediate / advanced example of using the VersionOne HTTP API with
        the open source jQuery, Backbone, and Backbone Forms libraries.
        <br/>
        <br/>
        <div style='border: 1px solid darkgray;padding:5px;background:linen'>
            	<h3>Instructions</h3>

            <ol>
                <li>1: Click <code>Load Story</code> and then hit <code>OK</code>
                    <br/>
                    <blockquote><i><span>Result</span>: Story details should load with values for <code>Name,Description,Estimate</code></blockquote></li>
          <li>2: Modify the story then hit <code>Save Story</code><br/><br/></li>
          <li>3: Click <code>Load Story</code> and set the fields to <code>Name,Description,Estimate,<b>RequestedBy</b></code></li>
		</ol>
      </div>
          
	<div class='editorDiv'>
        <div id="editor">
            
			<form id="editorForm">
                <fieldset>
                    <legend> VersionOne MetaMorfomizer Story Editor</legend>
              <div id="editorFields"></div>
                </fieldset>
            </form>
            <input type="button" id="save" value="Save Story" />&nbsp;<span id="message"></span><img id='saveSpinner' height='20' width='20' src="https://www12.v1host.com/s/12.3.5.45/css/images/loaders/ajax-loader.gif" />
		</div>
        
      <label for="StoryId"><b>Which Story do you want to edit?</b></label><input type="text" id="StoryId" value='1154' /> 
      <br />
      <label for="Fields"><b>Which attributes?</b></label>
      <select id='attributes' multiple='true'>
        <option value='Name'>Name</option>
        <option value='Description'>Description</option>
        <option value='Estimate'>Estimate</option>
        <option value='RequestedBy'>Requested By</option>
        <option value='Benefits'>Benefits</option>
        <option value='ToDo'>To Do</option>
      </select>
      <br />
      <input type="button" id="storyGet" value="Load Story" class='bbf-load' /> 
      <img id='spinner' class='bbf-load' height='20' width='20' src="https://www12.v1host.com/s/12.3.5.45/css/images/loaders/ajax-loader.gif" />
          </div>
	</body>
</html>
```

Here's the refactored JavaScript:

```javascript
/*
// Use this to snag fields from the query string:
function qs(key) {
    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}
*/
// This simulates getting field names from the query string:
function qs(key) {
    return 'Name,Description,Estimate';
}

Backbone.emulateHTTP = true; // Force backbone to use POST, not PUT on .save(...)

var siteRoot = 'http://eval.versionone.net/platformtest/';
var urlRoot = siteRoot + 'rest-1.v1/Data/Story/';
var metaUrl = siteRoot + 'meta.v1/Story?accept=application/json';
var l10nUrl = siteRoot + 'loc.v1';

var v1AtttributeTypeToBackboneFormsFieldMap = {
    'LongText': {
        type: 'TextArea'
    },
    'Text': {
        type: 'Text'
    },
    'Numeric': {
        type: 'Text',
        validators: [/^\d+$/]
    }
};

var headers = {
    Authorization: "Basic " + btoa("admin:admin"),
    Accept: 'haljson'
};

var fetchOptions = {
    dataType: 'json',
    headers: headers
};

var saveOptions = {
    contentType: 'haljson',
    patch: true,
    headers: headers
};

var formSchema = {};
var form = null;
var storyModel = Backbone.Model.extend({
    urlRoot: urlRoot,
    url: function () {
        if (!this.isNew()) return this.urlRoot + this.id;
        return this.urlRoot + this.id + '?sel=' + _.keys(formSchema).join(',');
    },
    save: function (attributes, options) {
        options || (options = saveOptions);
        return Backbone.Model.prototype.save.call(this, attributes, options);
    },
    fetch: function (options) {
        options || (options = fetchOptions);
        return Backbone.Model.prototype.fetch.call(this, options);
    }
});
var model = new storyModel();

function loadMeta(callback) {
    formSchema = {}; // reset the schema
    var attributes = getSelectedAttributesNames();
    $.ajax(metaUrl).done(function (data) {
        var titleRequests = [];
        var attributeNames = _.map(attributes, function (fieldName) {
            return "Story." + fieldName;
        });
        attribs = _.pick(data.Attributes, attributeNames);
        _.each(attribs, function (item, index) {
            var field = {};
            var mixThemInProps = v1AtttributeTypeToBackboneFormsFieldMap[item.AttributeType];
            _.extend(field, mixThemInProps);
            var isRequired = item.IsRequired;
            if (isRequired) {
                if (!field.validators) {
                    field.validators = [];
                }
                field.validators.push('required');
            }
            formSchema[item.Name] = field;
            var titleRequest = function () {
                var formField = field;
                return $.ajax(l10nUrl + '?' + item.DisplayName)
                    .done(function (data) {
                    formField.title = data;
                });
            };
            titleRequests.push(titleRequest);
        });
        $.when.apply(null, titleRequests).done(function () {
            callback();
        });
    });
}

function createForm(model) {
    var settings = {
        schema: formSchema
    };

    function finish() {
        form = new Backbone.Form(settings);
        $('#editorFields').empty();
        $('#editorFields').append(form.render().el);
        $("#editor").fadeIn();
    }
    if (model) {
        model.fetch(fetchOptions).done(function () {
            settings.model = model;
            finish();
        });
    } else {
        finish();
    }
}

function storyGet() {
    $('#storyGet').attr('disabled', 'disabled');
    $('#editor').fadeOut();
    $('#spinner').fadeIn();
    loadMeta(function () {
        model.id = $('#StoryId').val();
        if (model.id == '') {
            return;
        }
        createForm(model);
        $('#editor').delay(1000).fadeIn();
        $('#spinner').fadeOut(function () {
            $('#storyGet').removeAttr('disabled');
        });
    });
}

function storySave() {
    if (form.validate() !== null) return;
    form.commit();
    $('#save').attr('disabled', true);
    $('#message').hide();
    $('#saveSpinner').fadeIn();
    model.save(form.getValue()).done(function (data) {
        $('#saveSpinner').fadeOut(function () {
            $('#save').attr('disabled', false);
            $('#message')
                .text('Save successful!')
                .fadeIn()
                .delay(1500).fadeOut(1500);
        });
    });
}

function getSelectedAttributesNames() {
    var attributes = [];
    $('#attributes option:selected').each(function () {
        attributes.push($(this).attr('value'));
    });
    return attributes;
}

$(function () {
    var initialFields = qs('sel').split(',');
    _.each(initialFields, function (field) {
        var option = $('option[value="' + field + '"]');
        option.attr('selected', 'selected');
    });
    $('#save').click(storySave);
    $("#storyGet").click(storyGet);
});
```

And, the CSS has some improvements as well:

```css
body 
{
	padding: 5px;
  	font-family: sans-serif;
}  

#editor
{
  	padding: 10px;
  	border: 1px solid darkblue;
  	background: whitesmoke;
    display: none;
    margin-bottom: 15px;
}

label 
{
	color: darkblue;
}

textarea 
{
  height:100px;
}

#message 
{
  font-weight: bold;
  color: darkgreen;
}

/* From Backbone Forms github site */

/* Date */
.bbf-date .bbf-date {
  width: 4em
}

.bbf-date .bbf-month {
  width: 9em;
}

.bbf-date .bbf-year {
  width: 5em;
}


/* DateTime */
.bbf-datetime select {
  width: 4em;
}


/* List */
.bbf-list .bbf-add, .bbf-load {
  margin-top: -10px
}

.bbf-list li {
  margin-bottom: 5px
}

.bbf-list .bbf-del {
  margin-left: 4px
}


/* List.Modal */
.bbf-list-modal {
  cursor: pointer;
  border: 1px solid #ccc;
  width: 208px;
  border-radius: 3px;
  padding: 4px;
  color: #555;
}

/* Custom */

#spinner, #saveSpinner {
  display: none;
}

blockquote {
  font-size: 75%;
  font-weight: bold;
}

blockquote code {
  	font-size: 75%;
	background: beige;
}

blockquote span {
  color: darkgreen;
}

.editorDiv {
	margin-top: 10px;
  	padding: 10px;
  	border: 2px solid darkgray;
}  
```
You can try this out here: [MetaMorformizer](http://jsfiddle.net/hW8Ck/19/)

#TODO: below is all disorganized right now


 Replace the Handmade HTML Form with Backbone Forms
 - Replace `createStoryDto` with Backbone Forms' `getValue()` function




 - Create a Basic HTML Form to Edit a Story
 - Wire Up Some jQuery Event Handlers to Submit the Story
 - Conclusion: There's Got to be a Better Way!

```javascript
var urlRoot = 'http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/';

var headers = { 
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};

var fetchOptions = {
	dataType: 'json',
    headers: headers  	
};

var saveOptions = {
  contentType: 'haljson',
  patch: true,
  headers: headers
};

var formSchema = {
  	Name:  { 
      help:'Enter a story name', title:'Story Name', validators: ['required'] 
	},
  	Description: { title: 'Description', help: 'Enter a brief description of the story', validators: ['required']
  	},
  Estimate: {
    title: 'Estimate', help: 'Enter an estimated complexity between 1 and 5'
  }
};

var form = null;

function createForm(model) {
	var settings = {schema:formSchema};
  	function finish() {
  		form = new Backbone.Form(settings);
  		$('#editorFields').empty();
  		$('#editorFields').append(form.render().el);
      	$("#editor").fadeIn();
  	}
  	if (model) {    
    	model.fetch(fetchOptions).done(function() {
            console.log(model);
    		settings.model = model;
          	finish();
    	});    
  	} else {
    	finish();
  	}
}

function bindDtoToForm(data) {
  createForm(data);
}

function createDtoFromForm(selector) {
  return form.getValue();
}

var saveModel = false;
var model = new (Backbone.Model.extend({
  urlRoot: urlRoot,
  url: function() {
    if (saveModel)
		return this.urlRoot + this.id;    
    return this.urlRoot + this.id + '?sel='
    	+ _.keys(formSchema).join(',')
  }
}));


model.id = '';
function storyGet() {
    model.id = $('#StoryId').val();
  	console.log(model.id);
	if (model.id == '') 
    {
      return;
    }
    createForm(model);
}

function storySave() {
  Backbone.emulateHTTP = true;
  saveModel = true;
  form.commit();
  model.save(form.getValue(), saveOptions).done(function(data) {
    console.log('Saved!');
    console.log(data);
  });
}

var storyId = '';
$(function(){
  var storyId = '';
  
  createForm();
  
  $("#storyGet").click(storyGet);  
  $('#save').click(storySave);
});
```















# 4. Exercise: Use Backbone Forms and Play with Model Binding

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

The file `fields.coffee` contains the set of fields and their HTML form element type, plus a few other attributes. 
For scalar types, it's very simple.

By default, a project will use the fields specified in the `defuault` property. 

**Note**: To override that set for a specific project, simply add another property, at the same level as `default`, 
with the scope id, like `Scope:173519`. We'll cover this in a later section.

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

See the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for possible values of the `type` attribute for form element types.

**Note**: If you do visit the Backbone Forms documentation, you'll notice that `autofocus`, `optional`, and, of course `assetName` are not part of its API. 
That's because we pre-process these properties before passing this into Backbone Forms. 
We'll go into that in more detail in another section.

## 1. Generate a Simple JSON Object from the Form

This step demonstrates how Backbone Forms produces simple, clean JSON objects (POJSOs?) from its fields.

* Open Chrome's Developer Tools by hitting `F12` and select the Console tab
* Load the Requestor tool in the browser
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

* In the Console, type `JSON.stringify( v1AssetEditor.createDto() )`. You should see something like:

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

Here's what `createDto` actually does:

```coffeescript
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
```

The most important part to note here is the iteration over the `select` items. This jQuery selector is getting all the INPUT elements of type SELECT, and then creating relation references in the special `_links` property of the DTO. Then, it simply removes the prpoerty from the JSON object that was magically created by Backbone Forms. If you compare the output from the previous step, you'll notice that Priority was part of the top-level JSON object, whereas now it is inside the `_links` object.

That's really all that's needed to transform Backbone Forms' output into a VersionOne-compliant JSON DTO!

## 4. Create a new event handler to stringify the asset *"on update"*

If you change the `RequestedBy` or `Name` (Title on screen) fields, then click the `List` button, 
you'll notice that these changes are already reflected in the list. 
But, you don't see any additional traffic on the Network tab when you do this. 
That's because we're using [Backbone.Events](http://backbonejs.org/#Events) to create our own event handler, 
which subscribes to a custom event called `assetUpdated`. 

Here's how we do that way back inside of `VersionOneAssetEditor.constructor`:

```coffeescript
@on "assetUpdated", (assetEditor, asset) ->
	success "Save successful"
	assetEditor._normalizeIdWithoutMoment asset
	assetEditor._normalizeHrefWithoutMoment asset
	assetEditor.listItemReplace asset
```

And, here's how the event is triggered from inside of the `saveAsset` method. The same pathway is used for both create and update, but different event names are passed in for publication.

This section also ties together a lot of important architectural concepts, but we'll cover them in detail in the next section.

```coffeescript
createAsset: (assetName, callback) ->
  url = @getAssetUrl(assetName)
  @saveAsset url, "assetCreated", callback

updateAsset: (href, callback) ->
  url = @host + href + "?" + $.param(@queryOpts)
  @saveAsset url, "assetUpdated", callback

saveAsset: (url, eventType, callback) ->
  validations = @form.validate()
  if validations?
    error "Please review the form for errors"
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
```

Now, do you remember the JSON response body from part one in step 4, the one with the moments in it? If not, here's a snippet from that:

```json
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150/1321",
      "id": "Request:1150:1321"
    }
```

The *normalize* functions simply remove the moment number from the `id` and `href` values in the `_links.self` object. This is important because we need to load the latest, momentless version of the asset on click.

Now, add your own, additional event handler like this:

* Complete step one above, then:
* From the Console, type: `v1AssetEditor.on('assetUpdated', function(assetEditor, asset){ console.log(JSON.stringify(asset)); })` and hit enter
* Change the Deecription field on the form to `Backbone.Events is Awesome!` and hit `Save`
* You should see this in the Console:

```json
{
  "RequestedBy": "Blaine Stussy",
  "Name": "Add the Custom_Team custom field to the Request form",
  "Description": "Backbone.Events is Awesome!",
  "_links": {
    "self": {
      "href": "/platformtest/rest-1.v1/Data/Request/1150/1322",
      "id": "Request:1150:1322"
    },
    "Scope": [
      {
        "href": "/platformtest/rest-1.v1/Data/Scope/0",
        "idref": "Scope:0"
      }
    ],
    "Priority": [
      {
        "href": "/platformtest/rest-1.v1/Data/RequestPriority/169",
        "idref": "RequestPriority:169"
      }
    ]
  }
}
```
