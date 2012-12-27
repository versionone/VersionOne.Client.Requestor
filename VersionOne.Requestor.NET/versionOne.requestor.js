function VersionOneAssetEditor (options) {
    var contentType = "haljson";

    options.headers = {
        Authorization: 'Basic ' + btoa(this.versionOneAuth) // TODO: clean this up
    };
    options.whereCriteria = {
        Name: options.projectName
    };
    options.whereParamsForProjectScope = {
        acceptFormat: contentType,
        sel: ''
    };
    options.queryOpts = {
        acceptFormat: contentType
    };
    options.contentType = contentType;

    for(var key in options) {
        this[key] = options[key];
    }

    this.initializeThenSetup();
}

VersionOneAssetEditor.prototype.debug = function (message) {
    if (this.showDebug) {
        console.log(message)
    }
};

VersionOneAssetEditor.prototype.initializeThenSetup = function () {
    this.requestorName = "";

    if (this.serviceGateway) {
        this.setup();
        return;
    }
    var url = this.service + 'Scope' + '?where=' + $.param(this.whereCriteria)
        + '&' + $.param(this.whereParamsForProjectScope);
    this.debug('initializeThenSetup: ' + url);
    var that = this;
    $.ajax({
        url: url,
        headers: this.headers,
        type: 'GET'
    }).done(function (data) {
        if (data.length > 0) {
            that.projectScopeId = data[0]._links.self.id;
            that.setup();
        } 
        else {
            that.debug('No results for query: ' + url);
        }
    }).fail(this._ajaxFail);
};

VersionOneAssetEditor.prototype.setup = function () {
    if (this.serviceGateway) {
        this.host = this.serviceGateway;
        this.service = this.host + '/';
    }
    this.debug(this.fields);
    $('#assetForm').html($('#fieldsTemplate').render({
        fields: this.fields
    }));
    $('#assetForm').validVal();

    var that = this;
    $('#reset').click(function () {
        that.resetForm();
    });

    $('.new').click(function() {
        that.newAsset();
    });

    var selectFields = [];
    that.enumFields(function(key, field) {
        selectFields.push(key);
    });

    // Populate the assets list
    this.loadAssets(this.assetName, selectFields);

    var refreshList = $('#refreshList');
    refreshList.bind('click', function() {
        that.loadAssets(that.assetName, selectFields);
    });

    // Setup the data within select lists
    $(".selectField").each(function() {     
        that.debug(that);
        var item = $(this);
        var fieldName = item.attr("name");
        var field = that.findField(fieldName);
        var assetName = field.assetName;
        var fields = field.fields;
        if (fields == null || fields.length == 0) {
            fields = ['Name'];
        }

        var url = that.service + assetName + '?' + $.param(that.queryOpts) + '&'
            + $.param({sel: fields.join(',')});
        $.ajax({
            url: url,
            headers: this.headers,
            type: 'GET'
        }).done(function (data) {
            if (data.length > 0) {
                item.selectmenu();
                for(var i = 0; i < data.length; i++) {
                    var option = data[i];
                    item.append("<option value='" + option._links.self.id + "'>" + option.Name + "</option>");
                }
                item.selectmenu('refresh');
            }
            else {
                that.debug('No results for query: ' + url);
            }
        }).fail(this._ajaxFail);
    });

    this.toggleNewOrEdit('new');
};

VersionOneAssetEditor.prototype._ajaxFail = function(ex) {
    console.log(ex);
};

VersionOneAssetEditor.prototype.loadAssets = function (assetName, selectFields) {
    var url = this.getAssetUrl(assetName) + '&' + $.param({
        'sel': selectFields.join(',')
    });
    var request = this.createRequest({url: url});
    var that = this;
    var assets = $("#assets");
    assets.empty();
    $.ajax(request).done(function(data) {
        toastr.info("Found " + data.length + " requests");    
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            that.listAppend(item);
        }
        assets.listview('refresh');
    }).fail(this._ajaxFail);    
};

VersionOneAssetEditor.prototype.listAppend = function(item) {
    var assets = $("#assets");
    var templ = this.listItemFormat(item);
    assets.append(templ);
};

VersionOneAssetEditor.prototype.listItemFormat = function(item) {
    var templ = $('<li></li>');
    var that = this;
    templ.html($('#assetItemTemplate').render(item));
    templ.children('.assetItem').bind('click', function() {
        that.editAsset($(this).attr('data-href'));
    });
    return templ;
};

VersionOneAssetEditor.prototype.listItemReplaceFormat = function(item) {
    // Thanks to Moments:
    var id = item._links.self.id;
    id = id.split(":");
    id.pop();
    id = id.join(":");

    var templ = this.listItemFormat(item);
    var assets = $("#assets");

    var that = this;
    assets.find("li a[data-assetid='" + id + "']").each(function() {
        var listItem = $(this);        
        var newItem = that.listItemFormat(item);
        listItem.closest("li").replaceWith(newItem);
    });
    assets.listview('refresh');
};

VersionOneAssetEditor.prototype.newAsset = function() {    
    this.toggleNewOrEdit("new");
    this.changePage("#detail");
    this.resetForm();
    if (this.requestorName != "") {
        $("#RequestedBy").val(this.requestorName);
    }
};

VersionOneAssetEditor.prototype.editAsset = function(href) {
    var url = this.host + href + '?' + $.param(this.queryOpts);
    var request = this.createRequest({url:url});
    var that = this;
    $.ajax(request).done(function(data) {
        that.debug(data);
        that.enumFields(function(key, field) {
            that.debug("getting: " + key);
            var val = data[key];
            if (val != null && val != 'undefined') {
                var els = $('#' + key);        
                if (els.length > 0) {
                    that.debug(key);
                    var el = $(els[0]);
                    el.val(data[key]);
                }             
            }
            else { // See if a link exists
                // TODO: handle this better, but works for now...
                var links = data._links;
                var val = links[key][0];
                if (val != null) {
                    var id = val.idref;
                    var href = val.href;
                    // Again: hard-coded select list here:
                    var relUrl = that.host + href + '?' + $.param(that.queryOpts) + "&sel=Name";
                    var relRequest = that.createRequest({url:relUrl});
                    $.ajax(relRequest).done(function(data) {
                        if (data != null && data != 'undefined' && data != '') {                        
                            var els = $('#' + key);
                            if (els.length > 0) {
                                var select = $(els[0]);
                                select.selectmenu();
                                select.val(data._links.self.id);
                                select.selectmenu('refresh', true);
                            }
                        }
                    }).fail(this._ajaxFail);
                }
            }
        });
        that.toggleNewOrEdit('edit', href);
        that.changePage("#detail");
    }).fail(this._ajaxFail);
};

VersionOneAssetEditor.prototype.toggleNewOrEdit = function(type, href) {
    var save = $('#save');
    var saveAndNew = $('#saveAndNew');
    var that = this;
    if (type == 'new')
    {
        save.unbind('click');
        save.bind('click', function () {
            that.createAsset(that.assetName);
        });
        saveAndNew.unbind('click');
        saveAndNew.bind('click', function () {
            that.createAsset(that.assetName);
            that.newAsset();
        });
    }
    else if (type == "edit") 
    {
        save.unbind('click');        
        save.bind('click', function () {
            that.updateAsset(href);
        });
        saveAndNew.unbind('click');
        saveAndNew.bind('click', function () {
            that.updateAsset(href);
            that.newAsset();
        });        
    }
};

VersionOneAssetEditor.prototype.createRequest = function(options) {
    if (!this.serviceGateway) {
        options.headers = this.headers;
    };
    return options;
};

VersionOneAssetEditor.prototype.createAsset = function(assetName) {
    var url = this.getAssetUrl(assetName);
    this.requestorName = $("#RequestedBy").val();
    var that = this;
    this.saveAsset(url, function(data) {
        toastr.success("New item created");
        that.listItemReplaceFormat(data);
    });
};

VersionOneAssetEditor.prototype.updateAsset = function(href) {
    var url = this.host + href + '?' + $.param(this.queryOpts);
    var that = this;
    this.debug(url);
    this.saveAsset(url, function(data) {
        toastr.success("Save successful");
        that.listItemReplaceFormat(data);
        //that.updateList(data);
    });
};

VersionOneAssetEditor.prototype.saveAsset = function(url, callback) {
    var dtoResult = this.createDto();
    if (dtoResult[0] == true) {
        return;
    }
    this.clearErrors();
    var dto = dtoResult[1];

    var request = this.createRequest({
        url: url,
        type: 'POST',
        data: JSON.stringify(dto),
        contentType: this.contentType
    });
    var that = this;
    return $.ajax(request).done(function(data) {
        that.debug(data);
        callback(data);
    }).fail(this._ajaxFail);
};

VersionOneAssetEditor.prototype.updateList = function(data) {

    item = $('<li></li>');
    item.html($('#assetItemTemplate').render(data));
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
    attributes._links = {
        Scope: {
            idref: this.projectScopeId
        }
    };    
    var hasError = false;
    $('#assetForm .inputField').each(function () {
        var el = $(this);
        var id = el.attr('id');
        var val = el.val();
        var required = el.attr('data-required');
        var relationAssetName = el.attr('data-rel');
        if (required == 'true' && (val == null || val == 'undefined' || val == '')) {
            hasError = true;
            var error = $('#err' + id);
            var label = error.attr('data-label');
            error.text(label + ' is required');
        }
        if (relationAssetName != null && relationAssetName != '' && relationAssetName != 'undefined') {
            attributes._links[relationAssetName] = { idref: val };
        } else {
            if (id != 'undefined' && id != null) 
                attributes[id] = val;
        }
    });
    this.debug(attributes);
    return [hasError, attributes];
};

VersionOneAssetEditor.prototype.getAssetUrl = function(assetName) {
    var url = this.service + assetName + '?' + $.param(this.queryOpts);
    return url;
};
    
VersionOneAssetEditor.prototype.changePage = function(page) {
    this.debug(page);
    $.mobile.changePage(page);
};

VersionOneAssetEditor.prototype.clearErrors = function() {
    $('.error').text('');
};

VersionOneAssetEditor.prototype.resetForm = function() {
    this.debug('resetForm');
    $('#assetForm')[0].reset();
    // TODO: this is hard-coded
    var sel = $("#Priority");
    sel.val("RequestPriority:167");
    sel.selectmenu('refresh');
};

VersionOneAssetEditor.prototype.enumFields = function(callback) {
    for(var i in this.fields) {
        var field = this.fields[i];
        var key = field.name;
        callback(key, field);        
    }
};

VersionOneAssetEditor.prototype.findField = function(fieldName) {
    var fields = [null];
    var index = 0;
    var addField = function(key, field) {
        if (key == fieldName) {
            fields[index++] = field;
        }
    }
    this.enumFields(addField);
    
    return fields[0];
}