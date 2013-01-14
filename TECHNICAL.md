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

* Break up the v1AssetEditor into a few smaller parts
* Reduce use of callbacks (already using Backbone.Events in a couple key places) and jQuery Promises
* Better use of Backbone events, models, collections, views, routes, etc?
* Possible simplification with the YAML query support Joe has created for the multiple dropdown lists -- which are populated from custom field values specific to a customer's project
* Explore use of Backbone.sync + localStorage. [See this project](http://documentcloud.github.com/backbone/docs/backbone-localstorage.html) -- This would be for people able to create requests "off line", saved to localStorage, then put them into VersionOne when they are ready to, or when they have a network connection
* Ivory Towerish Infinite Genericization of the "v1AssetEditor" -- something that is entirely model-driven and can edit any type of asset based on its Meta definition
* Use of Jade for templates -- see this open-source project I'm working on OpenEpi Mobile

# Technical Highlights

## Backbone Forms

For a better understanding, take a look at the overview of [Backbone Forms](https://github.com/powmedia/backbone-forms) before proceding.

### Simple Backbone Forms Example

Or, for a summary understanding, here's one way a simple form is defined with Backbone Forms:

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

### Cooler Twitter Bootstrappified Backbone Forms Example with Subschema Object List

Or, [view this nice sample JSFiddle](http://jsfiddle.net/QY57e/) which uses Backbone Forms with the Twitter Bootstrap CSS and nested sub-models.

Note the `subSchema` definition for the weapon attribute.

### Dependent Dropdown Example

And, [This example](http://jsfiddle.net/nXHSX/) is a classic dependent dropdown example.



## Customer and Project-Specific Field Configuration File

The file `fields.coffee` contains the set of fields and their datatype, plus a few other attributes. For scalar types, it's very simple. See the [Backbone Forms](https://github.com/powmedia/backbone-forms) documentation for possible values of the `type` attribute for form element types.

For VersionOne relations, here's an exampe:

With a built-in VersionOne asset, `RequestPrioerity`:

```coffeescript
fieldsConfig =
  Priority:
    title: 'Priority'
    type: 'Select'
    assetName: 'RequestPriority'
```

And, it's basically the same with a customer-created custom field:

```coffeescript
fieldsConfig =
  Custom_ProductService:
    title: 'Product/Service'
    type: 'Select'
    assetName: 'Custom_Product'
```

```coffeescript
define ->
  fieldsConfig =
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

    'Scope:173519':
      RequestedBy:
        title: 'Requested By'
        autofocus: true
        
      Name:
        title: 'Request Title'

      Custom_RequestedETA:
        title: 'Requested by (ETA)'
        type: 'Date'

      Description:
        title: 'Request Description (Project & Why needed)'
        type: 'TextArea'
        optional: true

      Custom_ProductService:
        title: 'Product/Service'
        type: 'Select'
        assetName: 'Custom_Product'

      Custom_Team2:
        title: 'Team'
        type: 'Select'
        assetName: 'Custom_Team'

      Custom_HWRequestedlistandcostperunit:
        title: 'Capacity or HW Requested'
        type: 'TextArea'

      Custom_RequestImpact:
        title: 'Request Impact'
        type: 'Select'
        assetName: 'Custom_Severity'
```
