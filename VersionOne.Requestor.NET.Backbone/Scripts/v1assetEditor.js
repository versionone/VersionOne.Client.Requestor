define([
    'backbone',
    'underscore',
    'toastr',
    'jquery',
    'jquery.mobile',
    'jsrender'
    ], 
    function(Backbone, _, toastr, $) {

        $.fn.pressEnter = function(fn) { 
            return this.each(function() {
                $(this).bind('enterPress', fn);
                $(this).keyup(function(e){
                    if(e.keyCode == 13)
                    {
                      $(this).trigger('enterPress');
                    }
                })
            });
         };

        function log(message) {
            console.log(message);
        }

        function error(message) {
            toastr.error(message);
        }

        function success(message) {
            toastr.success(message);
        }

        function info(message) {
            toastr.info(message);
        }

        var debugEnabled = false;

        function debug(message) {
            if (debugEnabled) {
                console.log(message);
            }
        }

        function VersionOneAssetEditor (options) {
          var contentType = 'haljson';
          var that = this;

          debugEnabled = options.showDebug;

          function continueSettingOptions() {
            options.whereParamsForProjectScope = {
                acceptFormat: contentType,
                sel: ''
            };

            options.queryOpts = {
                acceptFormat: contentType
            };

            options.contentType = contentType;

            for(var key in options) {
                that[key] = options[key];
            }

            that.initialize();
          }

          if (options.serviceGateway) {
            $.ajax(options.serviceGateway)
            .done(function(data) {
              options.headers = data;
              continueSettingOptions(); 
            })
            .fail(function(ex){
              error('Failed to get setup data. The URL used was: ' + options.serviceGateway);
              log(ex);
            });
          }
          else {
            options.headers = {
              Authorization: 'Basic ' + btoa(options.versionOneAuth) // TODO: clean this up
            };
            continueSettingOptions();
          }
        }
        _.extend(VersionOneAssetEditor.prototype, Backbone.Events);

        VersionOneAssetEditor.prototype.debug = function (message) {
            if (this.showDebug) {
                log(message);
            }
        };

        VersionOneAssetEditor.prototype.initialize = function () {
            this.requestorName = '';
            this.refreshFieldSet('default');

            this.debug(this.formFields);

            var that = this;
            $('.new').click(function() {
                that.newAsset();
            });

            var selectFields = [];
            that.enumFields(function(key, field) {
                // TODO: hard-coded
                if (key != 'Description' && field.sel !== false) {
                  selectFields.push(key);
                }
            });

            that.selectFields = selectFields;

            $('#projectsPage').live('pageinit', this.configureProjectSearch);
            $('#list').live('pageinit', this.configureListPage);

            this.configureProjectSearch();

            this.toggleNewOrEdit('new');
        };

        VersionOneAssetEditor.prototype.refreshFormModel = function() {
            log(this.formFields[this.fieldSetName]);
            this.assetModel = Backbone.Model.extend({                
                schema: this.formFields[this.fieldSetName]
            });
        };

        VersionOneAssetEditor.prototype.configureProjectSearch = function() {
            var that = this;
            var searchTerm, ajaxRequest;
            var projectSearch = $('#projectSearch');
            projectSearch.pressEnter(function () {
                if (searchTerm == $(this).val()) return;
                searchTerm = $(this).val();
                if (searchTerm.length < 4) return;
                $.mobile.showPageLoadingMsg();
                if (ajaxRequest) {
                    ajaxRequest.abort();
                }
                var assetName = 'Scope';
                var url = that.getAssetUrl(assetName)
                    + '&' + $.param({sel: 'Name', page:'100,0', find:"'" + searchTerm + "'", findin:'Name'});
                var request = that.createRequest({url: url});
                var projects = $('#projects');
                ajaxRequest = $.ajax(request).done(function (data) {
                    ajaxRequest = undefined;
                    var projects = $('#projects').empty();
                    $.each(data, function (i, val) {
                        that.projectItemAppend(val);
                    });
                    projects.listview('refresh');
                    $.mobile.hidePageLoadingMsg();
                }).fail(that._ajaxFail);
            });
        };

        VersionOneAssetEditor.prototype.configureListPage = function() {
            var assets = $('#assets');
            assets.empty();
            assets.listview();
        };

        VersionOneAssetEditor.prototype._ajaxFail = function(ex) {
            console.log('Error: ');
            console.log(ex);
        };

        VersionOneAssetEditor.prototype.loadRequests = function (projectIdref) {
            this.projectIdref = projectIdref;
            this.refreshFieldSet(projectIdref);
            var url = this.getAssetUrl(this.assetName) + '&' + $.param({
                'where' : "Scope='" + projectIdref + "'",
                'sel': 'Name,RequestedBy',
                'page': '75,0' // TODO: temporary... until real paging support
                ,'sort': '-ChangeDate'
            });
            var request = this.createRequest({url: url});
            var that = this;
            var assets = $('#assets');
            assets.empty();
            $.ajax(request).done(function(data) {
                info('Found ' + data.length + ' requests');    
                for(var i = 0; i < data.length; i++) {
                    var item = data[i];
                    that.listAppend(item);
                }                
                assets.listview('refresh');
            }).fail(this._ajaxFail);  
            this.changePage('#list');
        };

        VersionOneAssetEditor.prototype.refreshFieldSet = function(fieldSetName) {
            if (this.formFields[fieldSetName] !== undefined) {
                this.fieldSetName = fieldSetName;
            } else {
                this.fieldSetName = 'default';
            }
            this.refreshFormModel();
            log(this.getFormFields());
        };

        VersionOneAssetEditor.prototype.getFormFields = function() {
            return this.formFields[this.fieldSetName];
        };

        VersionOneAssetEditor.prototype.getFormFieldsForSelectQuery = function() {
            var fields = [];
            this.enumFields(function(key) {
                fields.push(key);
            });
            fields = fields.join(',');        
            var fieldsClause =$.param({sel: fields});
            log(fieldsClause);
            return fieldsClause;
        };

        VersionOneAssetEditor.prototype.listAppend = function(item) {
            var assets = $('#assets');
            var templ = this.listItemFormat(item);
            assets.append(templ);
        };

        VersionOneAssetEditor.prototype.listItemFormat = function(item) {
            var templ = $('<li></li>');
            var that = this;
            templ.html($('#assetItemTemplate').render(item));
            templ.children('.assetItem').bind('click', function() {
                var href = $(this).attr('data-href');
                that.debug('Href: ' + href);
                that.editAsset($(this).attr('data-href'));
            });
            return templ;
        };

        VersionOneAssetEditor.prototype.projectItemAppend = function(item) {
            var projects = $('#projects');
            var templ = this.projectItemFormat(item);
            projects.append(templ);
        };

        VersionOneAssetEditor.prototype.projectItemFormat = function(item) {
            var templ = $('<li></li>');
            var that = this;
            templ.html($('#projectItemTemplate').render(item));
            templ.children('.projectItem').bind('click', function() {
                var idref = $(this).attr('data-idref');
                that.debug('Idref: ' + idref);
                that.loadRequests(idref);
            });
            return templ;
        };

        VersionOneAssetEditor.prototype.projectSelect = function(href) {
            projectSelect
        };

        VersionOneAssetEditor.prototype.listItemPrepend = function(item) {
            var templ = this.listItemFormat(item);
            var assets = $('#assets');
            assets.prepend(templ);
            assets.listview('refresh');
        };

        VersionOneAssetEditor.prototype._normalizeIdWithoutMoment = function(item) {
            var id = item._links.self.id;
            this.debug('The id from server with moment: ' + id);
            id = id.split(':');
            if (id.length == 3) {
                id.pop();
            }
            id = id.join(':');
            item._links.self.id = id;
            this.debug('Normalized id: ' + id);
        };

        VersionOneAssetEditor.prototype._normalizeHrefWithoutMoment = function(item) {
            var href = item._links.self.href;
            this.debug('The href from server with moment: ' + href);
            if (href.match(/\D\/\d*?\/\d*$/)) {
                href = href.split('/');
                this.debug('Items count: ' + href.length);
                href.pop();
                href = href.join('/');
                item._links.self.href = href;            
            }
            this.debug('Normalized href: ' + href);            
        };        

        VersionOneAssetEditor.prototype.listItemReplace = function(item) {
            // Thanks to Moments:
            var id = item._links.self.id;    

            var templ = this.listItemFormat(item);
            var assets = $('#assets');    

            var that = this;
            assets.find("a[data-assetid='" + id + "']").each(function() {
                that.debug('Found a list item:');
                that.debug(this);
                var listItem = $(this);        
                //var newItem = that.listItemFormat(item);
                listItem.closest('li').replaceWith(templ);
            });
            assets.listview('refresh');
        };

        VersionOneAssetEditor.prototype.newAsset = function(callback) {
            var that = this;
            var asset = new this.assetModel();
            this.asset = asset;

            var form = new Backbone.Form({
                model: asset
            }).render();

            this.form = form;

            $('#fields').html(form.el);

            if (!callback) {
                callback = function() {
                    that.toggleNewOrEdit('new');
                    that.changePage('#detail');
                    that.resetForm();
                }
            }

            this.configSelectLists().done(function() {
                that.debug('Config select lists is done...');
                callback();
            });

            $('#detail').trigger('create');

            // Hardcoded:
            if (this.requestorName != '') {
                $("[name='RequestedBy']").val(this.requestorName);
                $("[name='Name']").focus();
            } else {
                $("[name='RequestedBy']").focus();
            }
        };

        VersionOneAssetEditor.prototype.configSelectLists = function() {
            // Setup the data within select lists
            // TODO: this should not happen on EVERY new click.
            var that = this;
            var promise = new $.Deferred();
            var ajaxRequests = [];
            var selectLists = $("select[data-class='sel']");
            
            selectLists.each(function() {
                var item = $(this);
                var fieldName = item.attr('name');
                that.debug('Starting select list process for: ' + fieldName);
                var field = that.findField(fieldName);
                var assetName = field.editorAttrs['data-assetName'];
                var fields = field.formFields;
                if (fields == null || fields.length == 0) {
                    fields = ['Name'];
                }
                var url = that.service + assetName + '?' + $.param(that.queryOpts) + '&'
                    + $.param({sel: fields.join(',')});
                var request = that.createRequest({url:url, type:'GET'});
                var ajaxRequest = $.ajax(request).done(function (data) {                  
                  if (data.length > 0) {
                      item.selectmenu();
                      $.each(data, function(i, option) {                       
                          item.append("<option value='" + option._links.self.id + "'>" + option.Name + '</option>');
                      });
                      item.selectmenu('refresh');
                  }
                  else {
                      that.debug('No results for query: ' + url);
                  }
                }).fail(that._ajaxFail);
                that.debug('Ending select list process for: ' + fieldName);
                ajaxRequests.push(ajaxRequest);
            });    
            
            if (this.resolveIfEmpty(promise, ajaxRequests)) {
                return promise;
            }

            this.resolveWhenAllDone(promise, ajaxRequests);

            return promise;            
        };

        VersionOneAssetEditor.prototype.resolveIfEmpty = function(promise, ajaxRequests) {
            if (ajaxRequests.length < 1) {
                promise.resolve();
                return true;
            }
            return false;
        };

        VersionOneAssetEditor.prototype.resolveWhenAllDone = function(promise, ajaxRequests) {
            $.when.apply($, ajaxRequests).then(function() {
                promise.resolve();
            });
        };

        VersionOneAssetEditor.prototype.editAsset = function(href) {
            log('edit: ' + href);
            var url = this.host + href + '?' + $.param(this.queryOpts);
            var fieldsClause = this.getFormFieldsForSelectQuery();
            url += '&' + fieldsClause;
            var request = this.createRequest({url:url});
            this.debug('Fetching for edit: ' + url);
            var that = this;
            var populateForm = function() {
                $.ajax(request).done(function(data) {
                    log('Fetch for edit done: ' + href);
                    log('Fetched object data:');
                    log(data);
                    var modelData = that.form.getValue();
                    var links = data._links;
                    log(links);
                    for (var key in modelData) {
                        that.debug('Key: ' + key);
                        var value = data[key];
                        if (value) {
                            that.debug(value);                            
                            // TODO: hack:
                            if (key == 'Custom_RequestedETA') {
                                value = new Date(Date.parse(value));
                                value = new Date(2012, 11, 28)
                                that.debug('Converted to date: ' + value);
                            }
                            that.debug('Data[key]:');
                            that.debug(data[key]);
                            if (data[key] !== undefined) {
                                that.debug('setting: ' + key);
                                that.debug('Old Form value: ');
                                that.debug(that.form.getValue(key));
                                that.form.setValue(key, value);
                                that.debug('New Form value: ');
                                that.debug(that.form.getValue(key));
                            }
                            else {
                                that.debug('Setting Key: ' + key + ' is undefined');
                            }
                        }
                        else {
                            // TODO: need better way to do this
                            var rel = links[key];
                            if (rel === undefined)
                                continue;                            
                            var val = links[key];
                            if (val != null && val.length > 0) {
                                val = val[0];
                                var id = val.idref;
                                var assetHref = val.href;
                                // Again: hard-coded select list here:
                                var relUrl = that.host + assetHref + '?' + $.param(that.queryOpts) + '&sel=Name';
                                var relRequest = that.createRequest({url:relUrl});
                                // Must do this to ensure that the linkId is properly in the closure,
                                // not the most-recent value from above...
                                var getData = function(relKey, linkId) {
                                    $.ajax(relRequest).done(function(data) {
                                        if (data != null && data != 'undefined' && data != '') {                    
                                            var els = $("[name='" + relKey + "']");
                                            if (els.length > 0) {
                                                var select = $(els[0]);
                                                select.selectmenu();
                                                that._normalizeIdWithoutMoment(data);
                                                that.debug(relKey + ': ' + linkId);
                                                select.val(linkId);
                                                log('new val');
                                                log(select.val());
                                                select.selectmenu('refresh', true);
                                            }
                                        }
                                    }).fail(this._ajaxFail);
                                };
                                getData(key, id);
                            }
                        }
                    }
                    that.toggleNewOrEdit('edit', href);
                    that.changePage('#detail');
                    $('#detail').trigger('create');                    
                }).fail(this._ajaxFail);
            };
            that.newAsset(populateForm); // TODO: hacky.
        };

        VersionOneAssetEditor.prototype.toggleNewOrEdit = function(type, href) {
            var save = $('#save');
            var saveAndNew = $('#saveAndNew');
            var that = this;
            if (type == 'new')
            {
                save.unbind('click');
                save.bind('click', function (evt) {
                    evt.preventDefault();
                    that.createAsset(that.assetName, function(asset) {
                        // refresh
                        that.editAsset(asset._links.self.href);
                    });
                });
                saveAndNew.unbind('click');
                saveAndNew.bind('click', function (evt) {
                    evt.preventDefault();
                    that.createAsset(that.assetName, function() {
                        that.debug('About to call newAsset');
                        that.newAsset();
                        // Hardcoded:
                        $('#Name').focus();
                    });
                });
            }
            else if (type == 'edit') 
            {
                save.unbind('click');        
                save.bind('click', function (evt) {
                    evt.preventDefault();
                    that.updateAsset(href);
                });
                saveAndNew.unbind('click');
                saveAndNew.bind('click', function (evt) {
                    evt.preventDefault();
                    that.updateAsset(href, function() {
                        that.debug('edit:saveAndNew: about to call newAsset');
                        that.newAsset();
                    });
                });        
            }
        };

        VersionOneAssetEditor.prototype.createRequest = function(options) {
            if (!this.serviceGateway) {
                options.headers = this.headers;
            };
            return options;
        };

        VersionOneAssetEditor.prototype.createAsset = function(assetName, callback) {
            var url = this.getAssetUrl(assetName);
            this.requestorName = $('#RequestedBy').val();
            this.saveAsset(url, 'assetCreated', callback);
        };

        VersionOneAssetEditor.prototype.on('assetCreated', function(that, asset) {
            success('New item created');        
            that._normalizeIdWithoutMoment(asset);
            that._normalizeHrefWithoutMoment(asset);            
            that.listItemPrepend(asset);
        });

        VersionOneAssetEditor.prototype.updateAsset = function(href, callback) {      
            var url = this.host + href + '?' + $.param(this.queryOpts);
            this.debug(url);
            this.saveAsset(url, 'assetUpdated', callback);
        };

        VersionOneAssetEditor.prototype.on('assetUpdated', function(that, asset) { 
            success('Save successful');
            that._normalizeIdWithoutMoment(asset);
            that._normalizeHrefWithoutMoment(asset);
            that.listItemReplace(asset);
        });

        VersionOneAssetEditor.prototype.saveAsset = function(url, eventType, callback) {

            var validations = this.form.validate();

            if (validations != null) {
                error('Please review the form for errors', null,
                            { positionClass: 'toast-bottom-right' });
                return;
            }

            var dto = this.createDto();

            debug('Dto:');
            debug(dto);

            var request = this.createRequest({
                url: url,
                type: 'POST',
                data: JSON.stringify(dto),
                contentType: this.contentType
            });
            var that = this;
            $.ajax(request).done(function(data) {
                that.debug('Ajax done: ');
                that.debug(data);
                that.trigger(eventType, that, data);                
                if (callback) {
                    that.debug('About to call callback');
                    callback(data);
                }
            }).fail(this._ajaxFail);
        };

        VersionOneAssetEditor.prototype.createDto = function () {
            var dto = this.form.getValue();
            
            // TODO: hard-coded for test
            window.DTO = dto;            

            dto._links = {
                Scope: {
                    idref: this.projectIdref
                }
            };

            $('#fields select').each(function () {
                var el = $(this);
                var id = el.attr('name');
                var val = el.val();
                var relationAssetName = el.attr('data-rel');
                if (relationAssetName) {
                    dto._links[relationAssetName] = { idref: val };
                    delete dto[id];
                }
            });

            return dto;
        };

        VersionOneAssetEditor.prototype.getAssetUrl = function(assetName) {
            var url = this.service + assetName + '?' + $.param(this.queryOpts);
            return url;
        };
            
        VersionOneAssetEditor.prototype.changePage = function(page) {
            this.debug(page);
            $.mobile.changePage(page);
        };

        VersionOneAssetEditor.prototype.resetForm = function() {
            this.debug('resetForm');

            this.enumFields(function(key, field) {
                $("[name='" + key + "']").each(function() {
                    if (field.type != 'select') {
                        $(this).val('');
                        $(this).textinput();
                    }
                });
            });
            // TODO: this is hard-coded
            var sel = $("[name='Priority']");
            sel.selectmenu();
            sel.val('RequestPriority:167');
            sel.selectmenu('refresh');
        };

        VersionOneAssetEditor.prototype.enumFields = function(callback) {
            $.each(this.getFormFields(), function(key, field) {
                callback(key, field);     
            });
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

        return VersionOneAssetEditor;
    }
);