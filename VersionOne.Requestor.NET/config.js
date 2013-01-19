define(function() 
{	
	var showDebugMessages = false;

	var formFields = {
		BooleanTest : {
			title: 'This is a boolean',
			type: 'CheckBox'
		},
		DateTimeTest : {
			title: 'A DateTime Test',
			type: 'DateTime'
		},
		DateTest: {
			title: 'Just Date Test',
			type: 'Date'
		},
	    RequestedBy: { 
	    	title: 'Requested By', 
	    	validators: ['required'], 
	    	editorAttrs : { 
	    		autofocus:'autofocus' 
	    	} 
	    }, 
	    Name: { 
	    	title: 'Title', 
	    	validators: ['required'] 
	    }, 
	    Description: { 
	    	title: 'Description', 
	    	type: 'TextArea', 
	    	editorAttrs: { 
	    		style:'height:200px' 
	    	} 
	    }, 
	    Priority: { 
	    	title: 'Priority',
	    	type: 'Select',
	    	options: [], // Default to empty, they will get filled in from Ajax
	    	validators: ['required'], 
	    	editorAttrs: {
	    		'data-assetName': 'RequestPriority', 
	    		'data-rel': 'Priority'
	    	} 
	    }
	};

	//var host = 'http://platform-dev';
	//var service = 'http://platform-dev/CustomerTest/rest-1.v1/Data/';
	//var versionOneAuth = 'admin:Admin101#';

	var host = 'http://localhost';
	var service = 'http://localhost/VersionOne.Web/rest-1.v1/Data/';
	var versionOneAuth = 'admin:admin';

	var serviceGateway = false;
	//var serviceGateway = 'http://localhost/v1requestor/Setup';

	var projectName = "System (All Projects)'",
	var assetName = 'Request';

	var options = {
	    showDebug: showDebugMessages,
	    projectName: projectName,
	    host: host,
	    service: service,
	    serviceGateway: serviceGateway,
	    versionOneAuth: versionOneAuth,
	    assetName: assetName,
	    formFields: formFields
	}

	return options;
});