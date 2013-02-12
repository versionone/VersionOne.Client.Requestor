require.config({
	baseUrl: 'https://raw.github.com/versionone/VersionOne.Requestor.NET/master/VersionOne.FeatureRequestor/dynamic/Scripts'
});

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
        'text!index.html',     
        'config',
	'require',
        'jquery',
        'backbone',
        'backbone-forms',
        'editors/list',
        'templates/bootstrap', 
    	'toastr',
        'jsrender'
    ],
    function(
        indexHtml,
        v1config,
        require,
        $)
    {
        $('body').append($(indexHtml));
        require(['v1assetEditor'], function(v1assetEditor) {
            $.mobile.initializePage();            
            window.v1AssetEditor = new v1assetEditor(v1config);
            window.v1AssetEditor.on("assetFormCreated", function(assetForm) {
                window.v1RequestForm = assetForm;
            });
        });
	}
);