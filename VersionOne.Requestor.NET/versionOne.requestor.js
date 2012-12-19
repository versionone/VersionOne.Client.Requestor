function VersionOneAssetEditor (useServiceGateway, host, service, serviceGateway,
    versionOneAuth, assetName, fields, selectFields) {
    this.useServiceGateway = useServiceGateway;
    this.host = host;
    this.service = service;
    this.versionOneAuth = versionOneAuth;
    this.assetName = assetName;
    this.selectFields = selectFields;
    this.serviceGateway = serviceGateway;
    this.config(fields);
    this.initializeThenSetup();
}

VersionOneAssetEditor.prototype.config = function (fields) {
    var projectName = "'System (All Projects)'";
    var contentType = 'haljson';
        
    this.config = {
        projectName: projectName,
        projectScopeId: null,
        host: this.host,
        service: this.service,
        serviceGateway: this.serviceGateway,
        contentType: contentType,
        queryOpts: {
            acceptFormat: contentType
        },
        headers: {
            Authorization: 'Basic ' + btoa(this.versionOneAuth) // TODO: clean this up
        },
        whereCriteria: {
            Name: projectName
        },
        whereParams: {
            acceptFormat: contentType,
            sel: ''
        },
        fields: fields
    };
};

VersionOneAssetEditor.prototype.initializeThenSetup = function () {
    if (this.useServiceGateway) {
        this.setup();
        return;
    }
    var url = this.config.service + 'Scope' + '?where=' + $.param(this.config.whereCriteria)
        + '&' + $.param(this.config.whereParams);
    console.log('initializeThenSetup: ' + url);
    var that = this;
    $.ajax({
        url: url,
        headers: this.config.headers,
        type: 'GET'
    }).done(function (data) {
        if (data.length > 0) {
            that.config.projectScopeId = data[0]._links.self.id;
            that.setup();
        } 
        else {
            console.log('No results for query: ' + url);
        }
    }).fail(function (ex) { console.log(ex); });
};

VersionOneAssetEditor.prototype.setup = function () {
    if (this.useServiceGateway) {
        this.config.host = this.config.serviceGateway;
        this.config.service = this.config.host + '/';
    }

    $('#assetForm').html($('#fieldsTemplate').render({
        fields: this.config.fields
    }));
    $('#assetForm').validVal();

    var that = this;
    $('#create').click(function () {
        that.createAsset(assetName);
    });
    $('#reset').click(function () {
        that.resetForm();
    });

    $('.new').click(function() {
        that.newAsset();
    });

    // Populate the assets list
    this.loadAssets(this.assetName, this.selectFields);

    $(document).on('pagebeforechange', function(event, ui) {
        console.log("Id:");
        console.log(ui);
    });
};

VersionOneAssetEditor.prototype.loadAssets = function (assetName, selectFields) {
    console.log('loadAssets');
    var url = this.getAssetUrl(assetName) + '&' + $.param({ 
        'sel': selectFields
    });
    console.log('loadAssets: ' + url);
    var request = { url: url };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    var that = this;
    $.ajax(request).done(function(data) {
        console.log(data);
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            var templ = $('<li></li>');
            templ.html($('#assetItemTemplate').render(item));
            var link = templ.children('.assetItem').bind('click', function() {
                that.editAsset($(this).attr('data-href'));
            });
            $('#assets').append(templ);
        }        
        $('#assets').listview('refresh');
    }).fail(function(ex) { console.log(ex); });    
};

VersionOneAssetEditor.prototype.newAsset = function() {    
    $.mobile.changePage("#new");
    this.resetForm();
};

VersionOneAssetEditor.prototype.getAssetUrl = function(assetName) {
    var url = this.config.service + assetName + '?' + $.param(this.config.queryOpts);
    return url;
};

VersionOneAssetEditor.prototype.editAsset = function(href) {
    var url = this.config.host + href + '?' + $.param(this.config.queryOpts);
    var request = { url: url };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    var that = this;
    $.ajax(request).done(function(data) {
        that.enumFields(function(key, field) {
            var val = data[key];
            if (val != null && val != 'undefined') {
                var els = $('#' + key);
                console.log(els);
                if (els.length > 0) {
                    var el = $(els[0]);
                    el.val(data[key]);
                }             
            }
        });       
        $.mobile.changePage('#new');
    }).fail(function(ex) { console.log(ex); });
};

VersionOneAssetEditor.prototype.enumFields = function(callback) {
    for(var i in this.config.fields) {
        var field = this.config.fields[i];
        var key = field.name;
        callback(key, field);        
    }
};

VersionOneAssetEditor.prototype.updateAsset = function(href) {
    var url = this.config.host + href + '?' + $.param(this.config.queryOpts);
    var request = { 
        url: url,
        type: 'POST'
    };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    $.ajax(request).done(function(data) {
        console.log(data);
    }).fail(function(ex) { console.log(ex); });
};

VersionOneAssetEditor.prototype.createAsset = function (assetName) {
    var dtoResult = this.createDto();
    if (dtoResult[0] == true) {
        return;
    }
    this.clearErrors();
    var dto = dtoResult[1];
    var url = this.getAssetUrl(assetName);
    var request = {
        url: url,
        type: 'POST',
        data: JSON.stringify(dto),
        contentType: this.config.contentType
    };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    return $.ajax(request).done(function(data) {
        console.log(data);
        var item;
        item = $('<div></div>');
        item.html($('#assetItemTemplate').render(data));
        return $('#output').prepend(item);
    }).fail(function(ex) { console.log(ex); });
};

VersionOneAssetEditor.prototype.createDto = function (addProjectIdRef) {
    if (addProjectIdRef !== false) {
        addProjectIdRef = true;
    }
    var data = $('#assetForm').trigger('submitForm');
    if (!data) {
        return [true, null];
    }
    var attributes = {};
    var hasError = false;
    $('#assetForm .inputField').each(function () {
        var el = $(this);
        var id = el.attr('id');
        var val = el.val();
        var required = el.attr('data-required');
        if (required == 'true' && (val == null || val == 'undefined' || val == '')) {
            hasError = true;
            var error = $('#err' + id);
            var label = error.attr('data-label');
            error.text(label + ' is required');
        }
        return attributes[id] = el.val();
    });
    attributes._links = {
        Scope: {
            idref: this.config.projectScopeId
        }
    };
    console.log(attributes);
    return [hasError, attributes];
};
    
VersionOneAssetEditor.prototype.clearErrors = function() {
    $('.error').text('');
};

VersionOneAssetEditor.prototype.resetForm = function() {
    console.log('resetForm');
    $('#assetForm')[0].reset();
};