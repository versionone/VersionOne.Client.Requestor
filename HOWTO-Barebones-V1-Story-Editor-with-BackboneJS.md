# How To: Build a Barebones VersionOne Story Editor with jQuery in JSFiddle
 
This exercise will take you through building a very rudimentary Story editor using standard HTML and JavaScript. 
The only third-party library it will depend on is jQuery, and only for simple event handling and AJAX support.

# What you'll need:

* I've tested this in Google Chrome and Firefox, but not in other browsers, 
so if you run into any snags, please let me know

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

Live JSFiddle: [VersionOne Data API: Barebones Editor Step 1: Use jQuery to Fetch a Project Asset as JSON](http://jsfiddle.net/JoshGough/u6Grx/)

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

Live JSFiddle: [VersionOne API: Barebones Editor Step 2: Use jQuery to Fetch a Project Asset as XML](http://jsfiddle.net/JoshGough/vvQZ2/)

## Extend our JSFiddle Example with Basic HTML

Now, let's add some HTML to this thing, shall we?

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
* Run it! You should see a basic DIV with some CSS colors wrapping around our pretty JSON data result.

Live JSFiddle: [VersionOne API: Barebones Editor Step 3: Render a JSON Asset with Basic HTML](http://jsfiddle.net/JoshGough/34VJc/
)

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

Live JSFiddle: [VersionOne API: Barebones Editor Step 4: Issue a Barebones HTTP POST request to update a Story asset](http://jsfiddle.net/JoshGough/QMugh/)

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
