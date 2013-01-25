# How To: Create a Backbone.js Fortified Story Editor for the VersionOne Data API

In our last post, we created a "Barebones Story Editor", all by hand, with HTML form elements and jQuery.

But, wouldn't it be nice if we could make it easier to use and extend?

After all, who wants to have to go in to a block of HTML and add a bunch of markup 
***just because you need another field from your domain to show up***? Not you? Not me, either.

Let's revamp the last sample so that all it takes to add a new field is a **simple** configuration change 
the top of a small script. In the process, we'll incorporate some great and popular JavaScript libraries to 
reduce the amount of custom code we need to write and maintain!

**In this how-to, you will:***

* Refactor the Barebones Story Editor to become fortified with the popular Backbone.js library
* Learn how to extend Backbone.Model and override functions to work with HTTP APIs
* Learn the Backbone Forms library for creating HTML forms automagically from simple JS-based schemas
* Use some handy features of Underscore.js, Backbone's counterpart library for functional utilities

**What you'll need:**

* Like before, I've tested these in Google Chrome and Firefox, but not other browsers yet. Please 
let me know if you find issues in other browsers.

# Introduction and Live Finished JSFiddle Example

These days, you haven't really lived the JavaScript life unless you are using some (or all?) of the hot and popular
JavaScript libraries. If you're reading this, then you probably know the list even better than I do. Here are a few 
popular ones I know of:

* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)
* [Angular.js](http://angularjs.org/)
* [Knockout.js](http://knockoutjs.com/)
* [Spine.js](http://spinejs.com/)
* [Meteor.js](https://github.com/meteor/meteor)
* [Ember.js](http://emberjs.com/)
* [Batman.js](http://batmanjs.org/)
* [Sammy.js](http://sammyjs.org/)
* [Amplify.js](http://amplifyjs.com/)
* There's even [Knockback.js](http://kmalakoff.github.com/knockback/)

The list goes on, and on, and on! These libraries serve a multitude of purposes, but many attempt to provide an
"MV*" approach to cliet-side JavaScript development, with many of them providing strong support for consuming and
updating HTTP and REST-based server side APIs.

I don't have experience with all of these, but the VersionOne development team has been using several of these, 
notably Backbone.js. So, in this article, we're going to leverage Backbone.js, its sidekick Underscore.js, and 
a library named Backbone Forms that extends Backbone with form-creation and validation magical powers.

## Learn you some JS libraries for great good

However, if you are new to these libraries and want to go further in depth, I encourage you to check out these links:

* [Throne of JS conference videos and interviews](http://www.infoq.com/throne_of_js_2012/) - Friendlyish competition 
between 7 frameworks: Backbone.js, Ember.js, Meteor.js, AngularJS, Spine.js, CanJS, and Knockout.js
* [Client UI Smackdown](http://www.infoq.com/presentations/JavaScript-Frameworks-Review) - Craig Walls reviews 
several JavaScript client-side UI frameworks: Backbone.js, Spine.js, Knockout.js, Knockback.js, Sammy.js. 

Moving on! Here's our completed Backbone-Fortified VersionOne Story Editor: 
[http://jsfiddle.net/JoshGough/8XApF/](http://jsfiddle.net/JoshGough/8XApF/)

But, don't be a cheater. Keep going and build it step-by-step now:

## 1. HTML Skeleton

Get started by doing this:

* Using Google Chrome, browse to the empty fiddle template at 
[http://jsfiddle.net/JoshGough/tU2Ww/](http://jsfiddle.net/JoshGough/tU2Ww/)
* Click `Fork` at the top, which will create a new copy for you to use
* Type or paste the following HTML into the HTML panel of the fiddle:

```html
<html>
<head>
  <title>Barebones Story Editor</title>
</head>
<body>
  <h1>Barebones Story Editor</h1><br>
  <label for="storyId">Enter a Story ID:</label>
  <form>
    <input id="storyId" type="text"> <input id="storyLoad" type="button" value="Load Story">
  </form>
  <div id="editor">
    <form id="editorForm" name="editorForm">
      <h4>Story Details</h4>
      <hr>
      <div id="editorFields"></div>
    </form>
    <input id="storySave" type="button" value="Save Story">
  </div>
  <div id="message"></div>
</body>
</html>
```

Notice that instead of specifying all our form elements manually, we simply have a placeholder:

```HTML
<div id="editor">
  <form id="editorForm" name="editorForm">
    <h4>Story Details</h4>
    <hr>
    <div id="editorFields"></div>
  </form>
  <input id="storySave" type="button" value="Save Story">
</div>
```

This replaces the much more verbose HTML from before:

```HTML
<div id="editor">
  <form id="editorForm" name="editorForm">
    <label for="Name">Story Name:</label><br>
    <input id="Name" name="Name" type="text"><br>
    <label for="Name">Description:</label><br>
    <textarea id="Description" name="Description"></textarea><br>
    <label for="Estimate">Estimate:</label><br>
    <input id="Estimate" name="Estimate" type="text"><br>
  </form><input id="storySave" type="button" value="Save Story">
</div>
```

## Refactored JavaScript Code

The JavaScript code is so small, 75 lines, that you can just type or paste it in all at once. Each section has 
comments to explain its purpose:

```javascript
var StoryFormSchema = { // Backbone.Form will generate an HTML form based on this schema
  Name: { validators: ['required'] }, // Name is required
  Description: 'TextArea', // Since these next three are not required, we only need the data type
  Benefits: 'TextArea',
  Estimate: 'Number',
  RequestedBy: {} // Defaults to 'Text'
};

var storyForm = null; // Instance of the schema declared above, created when we click 'Load Story'
var urlRoot = 'http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/'; // V1 API URL base
var headers = { Authorization: 'Basic ' + btoa('admin:admin'), Accept: 'haljson' }; // Headers for auth and accept type format
Backbone.emulateHTTP = true; // Tells Backbone to issue a POST instead of a PUT HTTP method for updates
// Note that Models usually align with addressable HTTP resources, such as '/rest-1.v1/Data/Story/1154'
var StoryModel = Backbone.Model.extend({ // .extend comes from Underscore.js, for created an 'inherited' class
  urlRoot: urlRoot, // Sets the root url to the VP API URL base
  url: function () { // Override the built in url() for two cases:
    if (this.hasChanged() && !this.isNew()) return this.urlRoot + this.id; // In this case, just use the id -- used for save() via POST
    return this.urlRoot + this.id + '?sel=' + _.keys(storyForm.schema).join(','); // Otherwise, limit the attributes return to just what our form schema contains
  }, // Note that _.keys is another Underscore goody that returns an array of key names from an object
  fetch: function(options) { // Overrides the base fetch so we can customize behavior to be V1 API friendly
    options || (options = {}); // When no options passed, default to an empty object
    _.defaults(options, {dataType: 'json', headers: headers}); // Copies values from 2nd arg into the 1st if-and-only-if they don't exist already in the 1st
    return Backbone.Model.prototype.fetch.call(this, options); // Delegate to the base implementation
  },
  save: function(attributes, options) { // Similar override of base save
    options || (options = {});
    _.defaults(options, {contentType: 'haljson', patch: true, headers: headers}); // See extended comment below...
    return Backbone.Model.prototype.save.call(this, attributes, options);
  } // patch: true tells Backbone.sync to send a partial representation, and makes it use the PATCH HTTP method,
}); // but, since we did Backbone.emulateHTTP = true, it uses POST and sets X-HTTP-Method: PATCH as a header
var storyModel = new StoryModel(); // Concrete instance of our StoryModel. Alive at last!

function createForm(model) { // Called to use Backbone.Form with our schema to build the form and add it to the DOM
  var settings = {schema: StoryFormSchema}; // Gets passed to Backbone.Form constructor
  var finish = function() { // Gets called below, either immediately if model is null, or asynchronously after fetch
    storyForm = new Backbone.Form(settings); // Create concrete StoryForm instance
    $('#editorFields').empty(); // Empty out the DOM element for our fields!
    $('#editorFields').append(storyForm.render().el); // Construct the HTML for the form, and toss it into the DOM!
    if (model) $('#editor').fadeIn(); // Oooo, ahhh animated fade in.
  };  
  if (model) { // When called with a model instance:
    model.fetch().done(function(data) { // Make the model fetch itself, and when done:
      settings.model = model; // Assign a copy of the model into our settings hash, and:
      finish(); // FINISH!
    });
  } else finish(); // When no model passed, just finish immediately WITHOUT a settings.model, resulting in an empty form
}; // Note that we don't have this case in the app, but if you'd like to make an 'Add' mode, you could rely on this

function storyLoad() { // Called when you click 'Load Story'
  storyModel.id = $('#storyId').val(); // Extract the story id from the input field that we manually added
  if (storyModel.id === '') { // If empty, then:
    alert('Please enter a story id first'); // Warn, and:
    return; // Get out of here...
  }
  createForm(storyModel); // Pass the model into createForm, causing the if (model) branch to run, causing
};                        // model.fetch() to execute, causing Backbone.sync to the model from the V1 API, and
                          // causing finish() to execute, causing Backbone.Form and friends to execute and presto!
function storySave() { // Called when you click 'Save Story'
  if (storyForm.validate() != null) return; // Backbone Forms validates the form based on the schema we gave it, 
  storyForm.commit();
  storyModel.save(storyForm.getValue()).done(function(data) { // storyForm.getValue() gets data from the Backbone.Form instance, and .save() returns a jQuery deferred object, so we can pass a 'done' handler:
    $('#error').hide(); // done gets called on SUCCESS, so hide the errors element
    $('#message').text('Story saved!').fadeIn().delay(2500).fadeOut(); // More ooo, ahh animation for the success message
  }).fail(function(jqXHR) { // If the HTTP POST operation fails, this gets called to handle the error
    $('#message').hide(); // Get tid of the success message this time.
    $('#error').text('Error during save! See console for details.').fadeIn().delay(5000).fadeOut(); // Boooo, hiss!
    console.log(jqXHR); // Dump the raw jQuery XML HTTP Request object to the console
  });
};

$(function() { // Configure jQuery's document ready handler and GO!
  createForm(); // Create the form, without a model. Not terribly useful, really, because it will be hidden still
  $('#storyLoad').click(storyLoad); // Wire up the storyLoad click handler to its corresponding button
  $('#storySave').click(storySave); // Wire up storySave the same way
});
```

CSS
```
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

h4 {
  color: #666;
  font-style: italic;
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

#storyIdLabel {
  font-weight: 700;
}

#message {
  display: none;
  font-weight: 700;
  color: #006400;
}

#error {
  display: none;
  font-weight: 700;
  color: red;
}
```
