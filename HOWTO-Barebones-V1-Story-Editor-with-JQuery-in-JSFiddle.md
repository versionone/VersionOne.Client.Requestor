# How To: Build a Barebones VersionOne Story Editor with jQuery in JSFiddle
 
This exercise will take you through building a very rudimentary Story editor using standard HTML and JavaScript. 
The only third-party library it will depend on is jQuery, and only for simple event handling and AJAX support.

# In this how-to, you will:

* Get familiar with the JSFiddle online editor
* Use jQuery.ajax to issue both GET and POST (fetch, update) HTTP Requests to the VersionOne Data API
* Create a simple HTML form that lets you edit a VersionOne Story asset
* Build a simple, but fully functional, DTO [(Data Transfer Object)](http://martinfowler.com/eaaCatalog/dataTransferObject.html) 
binding function to populate the form from a JSON DTO fetched from the API
* Build a simple, and still fully function, function to create a JSON DTO from the HTML form for sending back to the server

# What you'll need:

* I've tested this in Google Chrome, but not in other browsers, so if you run into any snags, please let me know.

## 1. Get Familiar with JSFiddle

We're going to use JSFiddle to build our form. So, do this:

* Open a brand new window or tab in Chrome and navigate to [http://www.JSFiddle.net](http://www.jsFiddle.net)
* From the left side, under `Choose Framework`, `onLoad` should be preselected (leave it this way)
* Then select the most recent version of `jQuery`
* On the right, you'll see four panels: `HTML, JavaScript, CSS, and Result`
* We'll only use the JavaScript panel for now, so type this into it and then press `Run`:

```javascript
var host = "http://eval.versionone.net"; // Remote web server root
var service = host + "/platformtest/rest-1.v1/Data/"; // Path to the REST service
var assetQueryPath = "Scope/0"; // Location of an Asset to fetch
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

* Go ahead and run it now, and you should see a JSON result appear in the Result pane.

Live JSFiddle: [VersionOne Data API: Barebones Editor Step 1: Use jQuery to Fetch a Project Asset as JSON](http://jsfiddle.net/JoshGough/u6Grx/)

* For illustration purposes, now just paste in the following code. This time, you'll get the raw XML format 
because we do not pass the `acceptFormat=haljson` parameter. XML is the default data format the VersionOne Data API 
supports.

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

## 2. Extend our JSFiddle Example with Basic HTML

Now, let's add some HTML to this thing, shall we?

* Preferably in a new window or tab in Chrome, create a new fiddle at 
[http://www.JSFiddle.net](http://www.jsFiddle.net)
* Select `jQuery` as a the framework on the left side.
* In the HTML panel on the right, type or paste this:

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

* In the JavaScript pane, first just copy and paste the following:

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
```

* Type in the following JavaScript since it's a lot different from the first step's code:

```javascript
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
* Live JSFiddle: [VersionOne API: Barebones Editor Step 3: Render a JSON Asset with Basic HTML](http://jsfiddle.net/JoshGough/34VJc/
)

### Explanation

We're going to explain a lot more about this code after a few more steps, but here are some highlights for now:

* `$` is a shortcut for the `jQuery` object. It's just a lot easier to type `$` than `jQuery` since it 
gets used so often
* The code `$.ajax(...).done(...).fail(...)` tells jQuery to try to execute an HTTP request using 
ajax, and sets up a done function and a fail function
* Code like `$('#link')` and `

## 3. Issue a Barebones GET Story HTTP Request

Now that we're comfortable with JSFiddle, let's start building our Barebones Story Editor!

* Click or type the following URL into a new web browser tab's address bar:

[http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1154?acceptFormat=haljson&sel=Name,Description,Estimate]([http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1154?acceptFormat=haljson&sel=Name,Description,Estimate)

* You should see some JSON similar to this come back:

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

Our Barebones Story Editor will feature *just* Name, Description, and Estimate, so this query is enough for us to 
base our GET HTTP request on.

## 4. Issue a Barebones POST Story HTTP Request

* Now, preferably in a brand new JSFiddle tab, after selecting `jQuery` as your framework, paste 
this code into the JavaScript pane:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetPath = "Story/1154";
var headers = { 
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};  
```
* Type in this new code:

```javascript
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

* Go ahead and run the fiddle now

### Explanation

This time, we pass a few more settings to jQuery, such as the `POST` HTTP method, and, of course, 
a "stringified" DTO object with two properties that will overwrite those properties on the remote Story asset. 
If you examine the HTTP response using Chrome's Network tab, you'll notice also that the API's response 
contains **just those two attributes**.

Live JSFiddle: [VersionOne API: Barebones Editor Step 4: Issue a Barebones HTTP POST request to update a Story asset](http://jsfiddle.net/JoshGough/QMugh/)

## 5. Create the Barebones Story Editor HTML Form

Having explored all the major client-server interactions, let's now 
build the "simplest thing that could possibly work", to be agile, to edit the Story.

* Select `jQuery` as the framework from the left, then paste or type this into the HTML panel:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
  <title>Barebones Story Editor</title>
</head>

<body>
  <h1>Barebones Story Editor</h1><br>
  <label for="StoryId">Enter a Story ID:</label>

  <form>
    <input id="StoryId" type="text" value="1154">
    <input id="storyGet" type="button" value="Load Story">
    <br/>
    <br/>
  </form>

  <div id="editor">
    <form id="editorForm" name="editorForm">
      <label for="Name">Story Name:</label><br>
      <input id="Name" name="Name" type="text"><br>
      <label for="Name">Description:</label><br>
      <textarea id="Description" name="Description">
</textarea><br>
      <label for="Estimate">Estimate:</label><br>
      <input id="Estimate" name="Estimate" type="text"><br>
    </form>
    <input id="save" type="button" value="Save Story">
  </div>

  <div id="message"></div>
</body>
</html>
```

* Add this to the CSS panel:

```css
body {
  padding: 5px;
  font-family: sans-serif;
}

#editor {
  padding: 10px;
  border: 1px solid #00008B;
  background: #F5F5F5;
  display: none;
}

label {
  color: #00008B;
}

textarea {
  height: 100px;
}

#message {
  margin-top: 5px;
  color: #006400;
}
```

* And, to wrap it up, paste this into the JavaScript pane:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetPath = "Story/";
var select = "?sel=Name,Description,Estimate"
var headers = {
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};
```
* Then, type in this new code:

```javascript
$(function () {
  var storyId = '';
  $("#storyGet").click(function (e) {
    storyId = $('#StoryId').val();
    if (storyId == '') {
      return;
    }
    url = service + assetPath + storyId + select
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      headers: headers
    }).done(function (data) {
      bindDtoToForm(data);
      $("#editor").show();
    }).fail(function (jqXHR) {
      alert('Error during get. See console for details.');
      console.log('Error:');
      console.log(jqXHR.responseText);
    });
  });
  
  $('#save').click(function () {
    var storyDto = createDtoFromForm("#editorForm input, #editorForm textarea");
    $.ajax({
      url: service + assetPath + storyId,
      type: 'POST',
      data: JSON.stringify(storyDto),
      dataType: 'json',
      contentType: 'haljson',
      headers: headers
    }).done(function (data) {
      $('#message').text('Save successful! You can load it in VersionOne and see the results of your labor.');
      console.log(data);
    }).fail(function (jqXHR) {
      alert('Error during save. See console for message.');
      console.log('Error on save:');
      console.log(jqXHR.responseText);
    });
  });
});

function bindDtoToForm(data) {
  for (var key in data) {
    $("#" + key).val(data[key]);
  }
}

function createDtoFromForm(selector) {
  var dto = {};
  $(selector).each(function () {
    var item = $(this);
    var id = item.attr('id');
    dto[id] = item.val();
  });
  return dto;
}
```
# Whoah, that was a lot of code! Slow down and explain some of it?

**Agreed.** Let's start here:

```javascript
$(function () {
  var storyId = '';
  $("#storyGet").click(function (e) {
    storyId = $('#StoryId').val();
    if (storyId == '') {
      return;
    }
    url = service + assetPath + storyId + select
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      headers: headers
    }).done(function (data) {
      bindDtoToForm(data);
      $("#editor").show();
    }).fail(function (jqXHR) {
      alert('Error during get. See console for details.');
      console.log('Error:');
      console.log(jqXHR.responseText);
    });
  });
  // ... etc
```

### jQuery document ready handler shortcut

The first bit of code, the weird `$(function() { ...` uses jQuery's shortcut for the 'document ready handler'. This 
instructs jQuery to execute the function passed to it when the Document Object Model (DOM) is ready. To read more 
about this, visit the [jQuery web site](http://api.jquery.com/ready/).

### jQuery selectors shortcuts

After that, we use another jQuery shortcut for [selecting an element](http://api.jquery.com/category/selectors/) 
out of the DOM: `$("#storyGet")`. This is a shortcut for calling `document.getElementById("#storyGet")`, 
which selects the button from our HTML form. Having that form element selected, we call the `click` function, which 
fill bind the passed function to the `click` event of the element (or elements) selected by the selector. 

### Simple access to form data with jQuery's `val()` function

From there, we try to pull out the value of the text box element named `#StoryId` using the jQuery [`val()` function]
(http://api.jquery.com/val/), and return if it's empty.

### Create the resource URL by string concatenation

If it's not empty, we build up the URL for where to load the story from. 

Let's remember the initial configuration variables we had in the beginning of the script:

```javascript
var host = "http://eval.versionone.net";
var service = host + "/platformtest/rest-1.v1/Data/";
var assetPath = "Story/";
var select = "?sel=Name,Description,Estimate"
var headers = {
  Authorization: "Basic " + btoa("admin:admin"),
  Accept: 'haljson'
};
```

Now, supposing we type `1154` into the `StoryId` textbox, then the following line:

`url = service + assetPath + storyId + select`

will evaluate to:

`http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/1154/?sel=Name,Description,Estimate'

### Ajax cleans up remote data access

The remainder of the function's code uses jQuery's handy [`ajax` function](http://api.jquery.com/jQuery.ajax/):

```javascript
$.ajax({
  url: url,
  type: 'GET',
  dataType: 'json',
  headers: headers
}).done(function (data) {
  bindDtoToForm(data);
  $("#editor").show();
}).fail(function (jqXHR) {
  alert('Error during get. See console for details.');
  console.log('Error:');
  console.log(jqXHR.responseText);
});
```

The parameters object hash parameters are:

* `url` *the url we just built, providing the resource location that we want to load from the API*
* `type` *the HTTP method to use for the request. We are simply fetching data, so we use HTTP GET*
* `dataType` *this tells jQuery to expect the data coming back to be json, no matter what the content-type header says*
* `headers` *we pass along the headers object to Authorize with the specificied credentials, and what data format we will Accept*

### Understanding jQuery Deferred Objects for asynchronous operations

The next part looks a little weird. `.done(...)` and then `.fail(...)`. jQuery 1.5 introduced the 
[Deferred Object](http://api.jquery.com/category/deferred-object/).

Here's a summary of what it's for from the documentation link above:

```text
The Deferred object, introduced in jQuery 1.5, is a chainable utility object created by calling the 
jQuery.Deferred() method. It can register multiple callbacks into callback queues, invoke callback queues, 
and relay the success or failure state of any synchronous or asynchronous function.

The Deferred object is chainable, similar to the way a jQuery object is chainable, but it has its own methods. 
After creating a Deferred object, you can use any of the methods below by either chaining directly from the 
object creation or saving the object in a variable and invoking one or more methods on that variable.
```

Most of the functions on a Deferred Object accept a function parameter that will get called in response to 
certain events. In our case, the `ajax()` call creates a Deferred object that wraps an underlying [XMLHttpRequest]
(http://www.w3.org/TR/XMLHttpRequest/)used to communicate with the VersionOne Data API. As you probably know, this
object makes calls asynchronously, so we cannot expect the request to complete before the next line of code runs!

#### Handling successful HTTP requests with a `done()` callback

Because of this, we supply the `done()` function with a 
[callback function](http://en.wikipedia.org/wiki/Callback_(computer_programming)) that jQuery itself will invoke 
when the request successfully returns data from the remote web server hosting the API.

The callback itself will accept a parameter with the content returned by the server. In our case, we name it
`data` and then we pass it off to the `bindDtoToForm()` function, which we'll explain in a moment. After that, 
we simply call `$("#editor").show()`, which finds the `#editor` DIV element, and invokes jQuery's
[`show()`](http://api.jquery.com/show/) function to cause the DIV to become visible in the UI.

#### Handling failed HTTP requests with a `fail()` callback

Now, if you thought that the `fail()` function accepts a function to call when the request fails, then you'd be 
correct. In that case, jQuery returns to us its jqXHR object that made the call to the server. This is an instance 
of the jqXHR object. This topic is a bit out of scope, and quite low-level, for this article, but you can [read 
more about it here](http://api.jquery.com/jQuery.ajax/#jqXHR).

### Populating the HTML form with `bindDtoToForm()`

This is one of the easiest parts of the whole app! Yet, so many people fail to recognize how easy it is to 
do this:

```javascript
function bindDtoToForm(data) {
  for (var key in data) {
    $("#" + key).val(data[key]);
  }
}
```

All that this does is:

* Iterate over each key in the JSON DTO that we got from the server, then:
* Use jQuery's selector shortcut we just examined to find the corresponding HTML form element, and:
* Use the `val()` function we already examined to set the value in the form element.

For reference, the JSON DTO will look something like this:

```json
{
  "Name": "Tutorial Story",
  "Description": "Sample tutorial story",
  "Estimate": "5"
}
```

So, if we were to write all the code we needed by hand to achive the same thing, it would look like this:

```javascript
function bindDtoToForm(data) {
 $('#Name').val(data.Name); // or data['Name'], as these are equivalent
 $('#Description').val(data.Description);
 $('#Estimate').val(data.Estimate); 
}
```

So, while in this case we only save 1 line of code, you can probably imagine how tedious it would be to write all
that code by hand if we had 10 fields, or 100 fields. The first version, with the for loop, will handle 3 fields 
or 300 fields with no additional code. ***Don't let me catch you putting 300 fields on a form, however!***

**Done.**

### Creating the DTO from the form to send to the API

TODO

# Conclusion

That's it! You now have a complete Barebones Story Editor. Did you notice how easy it was to build up the DTO 
using the `createDtoFromForm` function? Well, it will be even easier than that when we add 
some **Backbone** to this and use **Backbone Forms** in the next episode!

* Live JSFiddle: [VersionOne API: Barebones Editor Step 5: Putting it all together: The Barebones Editor!](http://jsfiddle.net/JoshGough/8fKLd/)
* For your curiosity, a live JSFiddle with CoffeeScript: [VersionOne API: Barebones Editor Step 5: Putting it all together: The Barebones Editor in CoffeeScript!](http://jsfiddle.net/JoshGough/sQ4Ya/)

# Related Resources

TODO: add some...
