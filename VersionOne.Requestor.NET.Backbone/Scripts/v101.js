// Service urls, and HTTP settings
var urlRoot = 'http://eval.versionone.net/platformtest/rest-1.v1/Data/Story/';

var headers = { 
    Authorization: "Basic " + btoa("admin:admin"), // Allow us to authenticate against the instance above
    Accept: 'haljson' // Specify HAL + JSON as the data format we want back from the server
};

var defaultFetchOptions = { // jqHXR options used for HTTP GETs by Backbone.sync
    dataType: 'json', 		// Specify to jQuery's AJAX support that the data coming back is actually JSON
    headers: headers 		// Attach the headers defined above to the request
};

var defaultSaveOptions = { 	// jqXHR options used for HTTP POST (or PUT) by Backbone.sync
    contentType: 'haljson',	// Tell the VersionOne API that the data is in HAL + JSON format, not XML (default)
    patch: true, 			// Tell Backbone.sync that we are sending a partial representation to the server
    headers: headers		// Attach the headers defined above to the request
};
// Backbone model for story
var StoryModel = Backbone.Model.extend({ // .extend comes from Underscore.js, for created an 'inherited' class
    urlRoot: urlRoot, 
    url: function () { // Override the built in url() for two cases:
        if (!this.isNew()) return this.urlRoot + this.id; // When model is NOT isNew, then just use the id -- used for save() via POST
        return this.urlRoot + this.id + '?sel=' + _.keys(storyForm.schema).join(','); // Use V1 API to select partial attributes
    },
    save: function (attributes, options) { // Override base save() function
        options || (options = defaultSaveOptions); // Specify to use the defaultSaveOptions from above for the options hash passed to jqXHR
        return Backbone.Model.prototype.save.call(this, attributes, options); // Delegate to the base class implementation
    },
    fetch: function (options) { // Similar to above, override in order to provide default options hash
        options || (options = defaultFetchOptions);
        return Backbone.Model.prototype.fetch.call(this, options);
    }
});

var storyModel = new StoryModel(); // Create a concrete instance of the StoryModel class created above

// Backbone Forms schema
var StoryFormSchema = { // Define a schema for the form that Backbone Forms will build and display for editing a story
    Name: { validators: ['required'] }, // By default, the 'type' will be 'Text', but we need to specify that this one is required
    Description: { type: 'TextArea' }, // Description is a LongText in VersionOne, so map to 'TextArea'
    Benefits: { type: 'TextArea' }, // Not required, used for providing story context    
	Estimate: { type: 'Number' }, // Estimate should only take Numbers -- Backbone Forms will enforce this!
    RequestedBy: {} // Not required, defaults to type: 'Text'
};

var storyForm = null; // In response to button click events, this will hold a concrete instance of Backbone.Form, based upon StoryFormSchema

// UI functions
function createForm(model) { 		// This will be called to build the form and display it in the page
    var settings = { 				// Settings hash for the Backbone.Form constructor
        schema: StoryFormSchema 	// Give it the StoryFormSchema we defined above
    };

    function finish() { 									// Define this function here for creating the form and adding it to the DOM
        storyForm = new Backbone.Form(settings); 			// Create the concrete storyForm instance
        $('#editorFields').empty(); 						// Make sure this DOM element is empty!
        $('#editorFields').append(storyForm.render().el);	// Complete the rendering of the HTML and toss it into the DOM
        if (model) {										// If we called this function with an actual model:
        	$("#editor").fadeIn();							// Fade the form into view; Otherwise, don't show it yet. Not until 'Load Story' is clicked
        }
    }
    if (model) { 											// If we passed a model in, then:
        model.fetch().done(function () {					// Call the fetch function, which Backbone.Model provides, and we overrode above.
            settings.model = model;							// Once it completes, it calls this function and we store the model in the settings hash
            finish();										// Call finish, to jump above and create the form and add it to the DOM
        });	
    } else {												// If we didn't pass a model, then:
        finish();											// Call finish, without having called model.fetch, and thus it will create, but not show the form
    }
}
// Functions to communicate with VersionOne REST API via Backbone.sync functions
Backbone.emulateHTTP = true; // Because VersionOne's API does not yet support the PUT HTTP method, this forces Backbone.sync to use POST

function storyLoad() { 							// Function called when the 'Load Story' button is clicked
    storyModel.id = $('#storyId').val(); 		// Extract the value of the story id from the input field 
    if (storyModel.id == '') {					// If empty, then:
        alert('Please enter a story id first');	// Warn, and:
        return;									// Get out of here!
    }
    createForm(storyModel);						// Call createForm, passing in our storyModel, which will now have an id set on it, and thus:
}												// the branch on line 63 will execute, causing the fetch() function to be called, causing Backbone to get the model from the VersionOne server

function storySave() {														// Function called when the 'Save Story' button clicked
    if (storyForm.validate() != null) return;								// Backbone Forms validates the data based on the schema we gave it. Null indicates no errors. If there are errors, it will highlight the field and display a message next to it, but also return an object with more info
    storyForm.commit(); 													// Causes the changes to be commited to the underlying model
    storyModel.save(storyForm.getValue()).done(function (data) {			// TODO: complete
        $('#error').hide();
        $('#message').text('Story saved!').fadeIn().delay(2500).fadeOut();
    }).fail(function(jqXHR) {
        $('#message').hide();
        $('#error').text('Error during save! See console for details.').fadeIn().delay(5000).fadeOut();
        console.log(jqXHR);
    });
}
// Configure jQuery's document ready handler and GO!
$(function () {
    createForm();
    $("#storyGet").click(storyLoad);
    $('#save').click(storySave);
});