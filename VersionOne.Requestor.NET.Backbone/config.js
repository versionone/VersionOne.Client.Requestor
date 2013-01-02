define(function() 
{	
	var showDebugMessages = true;

	var formFields = {
/*
		BooleanTest : {
			title: 'This is a boolean',
			type: 'Checkbox',
			sel: false
		},
*/		
	    RequestedBy: { 
	    	title: 'Requested By', 
	    	validators: ['required'], 
	    	editorAttrs : { 
	    		autofocus:'autofocus' 
	    	} 
	    }, 
	    Name: { 
	    	title: 'Request Title', 
	    	validators: ['required'] 
	    }, 
		Custom_RequestedETA: {
			title: 'Requested by (ETA)',
			type: 'Date',
			validators: ['required']
		},
	    Description: { 
	    	title: 'Request Description (Project & Why needed)', 
	    	type: 'TextArea', 
	    	editorAttrs: { 
	    		style:'height:200px' 
	    	} 
	    }, 
	    Custom_ProductService: {
	    	title: 'Product/Service',
	    	type: 'Select',
	    	options: [], // Default to empty, they will get filled in from Ajax
	    	validators: ['required'], 
	    	editorAttrs: {
	    		'data-class': 'sel',
	    		'data-assetName': 'Custom_Product', 
	    		'data-rel': 'Custom_ProductService'
	    	} 
	    },	    
	    Priority: {
	    	title: 'Priority',
	    	type: 'Select',
	    	options: [], // Default to empty, they will get filled in from Ajax
	    	validators: ['required'], 
	    	editorAttrs: {
	    		'data-class': 'sel',
	    		'data-assetName': 'RequestPriority', 
	    		'data-rel': 'Priority'
	    	} 
	    }
	};

	//var host = 'http://platform-dev';
	//var service = 'http://platform-dev/CustomerTest/rest-1.v1/Data/';
	//var versionOneAuth = 'admin:Admin101#';

	//var host = 'http://localhost';
	//var service = 'http://localhost/VersionOne.Web/rest-1.v1/Data/';
	//var versionOneAuth = 'admin:admin';

	var host = 'https://www12.v1host.com';
	var service = 'https://www12.v1host.com/ProofpointAPITest/rest-1.v1/Data/';
	var versionOneAuth = 'bstussy:Proofpoint!';	

	var serviceGateway = false;
	//var serviceGateway = 'http://localhost/v1requestor/Setup';

	var projectName = "'System (All Projects)'";
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