requirejs.config({
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

require(['backbone', 'backbone-forms', 'editors/list', 'templates/bootstrap', 
	'toastr', 'v1assetEditor', 'jquery', 'jsrender'], 
	function(Backbone, bbforms, editorList, templatesBootstrap, toastr, v1assetEditor, $) {
	$(document).ready(function () {
	    //var host = "http://platform-dev";
	    //var service = "http://platform-dev/CustomerTest/rest-1.v1/Data/";
	    //var versionOneAuth = "admin:Admin101#";

	    var host = "http://localhost";
	    var service = "http://localhost/VersionOne.Web/rest-1.v1/Data/";
	    var versionOneAuth = "admin:admin";

	    var showDebugMessages = false;

	    var serviceGateway = false;
	    //var serviceGateway = "http://localhost/v1requestor/Setup";
	    
	    var options = {
	        showDebug: showDebugMessages,
	        projectName: "'System (All Projects)'",
	        host: host,
	        service: service,
	        serviceGateway: serviceGateway,
	        versionOneAuth: versionOneAuth,
	        assetName: "Request",
	        fields: {
	            RequestedBy: { title: 'Requested By', validators: ['required'], editorAttrs : { autofocus:'autofocus' } }
	            , Name: { title: 'Title', validators: ['required'] }
	            , Description: { title: 'Description', type: 'TextArea', editorAttrs: {style:'height:200px'} }
	            , Priority: { 
	            	title: 'Priority', type: 'Select', options: [], validators: ['required'], 
	            	editorAttrs: {'data-assetName': 'RequestPriority', 'data-rel': 'Priority'} 
	            }
	        }
	        , fieldsOld: [
	            {
	                name: 'RequestedBy',
	                label: 'Requested By',
	                required: true,
	                autofocus: 'autofocus',
	                placeholder: 'Your name',
	                type: 'text',
	                def: ''
	            }
	            ,{
	                name: 'Name',
	                required: true,
	                placeholder: 'Brief request title',
	                label: 'Title',
	                autofocus: '',
	                type: 'text',
	                def: ''
	            }    
	            ,{
	                name: 'Description',
	                label: 'Description',
	                placeholder: 'Give enough detail to aid follow-up conversations',
	                required: false,
	                autofocus: '',
	                def: '',
	                type: 'textarea',
	                height: 200
	            }
	            ,{
	                name: 'Priority',
	                required: true,
	                label: 'Priority',
	                def: '', // TODO: handle this meaningfully
	                type: 'select',
	                assetName: 'RequestPriority'
	            }            
	        ]
	    };
	    var editor = new v1assetEditor(options);
	});
});