This describes the technical implementation of the VersionOne Requestor tool.

# Technologies Used

* VersionOne.SDK.Experimental Api Input / Output Translators -- converts JSON (HAL compliant) to V1 XML on inbound, and reverse on outbound
* Backbone.js -- only utilizing Backbone.Events and models at a rudimentary level right now
* Backbone Forms -- dynamically creates the HTML form based on a lightweight "schema" defined in JS
* jQueryMobile -- mobile-friendly HTML5 framework
* toastr -- simple "toast" status messages
* RequireJS -- module loading
* CoffeeScript -- love it, or leave it, that's your choice. I dig it.

# Areas for Possible Improvement

* Better use of Backbone models, collections, views, routes, etc?
* Possible simplification with the YAML query support Joe has created for the multiple dropdown lists -- which are populated from custom field values specific to a customer's project
* Explore use of Backbone.sync + localStorage. [See this project](http://documentcloud.github.com/backbone/docs/backbone-localstorage.html) -- This would be for people able to create requests "off line", saved to localStorage, then put them into VersionOne when they are ready to, or when they have a network connection
* Ivory Towerish Infinite Genericization of the "v1AssetEditor" -- something that is entirely model-driven and can edit any type of asset based on its Meta definition
* Use of Jade for templates -- see this open-source project I'm working on OpenEpi Mobile
