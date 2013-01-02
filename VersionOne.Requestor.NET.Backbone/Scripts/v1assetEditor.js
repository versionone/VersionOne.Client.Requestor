define([
    'backbone',
    'underscore',
    'toastr',
    'jquery',
    'jquery.mobile',
    'jsrender'
    ], 
    function(Backbone, _, toastr, $) {

        function log(message) {
            console.log(message);
        }

        function VersionOneAssetEditor (options) {
          var contentType = "haljson";
          var that = this;

          function continueSettingOptions() {
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
                that[key] = options[key];
            }

            that.initializeThenSetup();
          }

          if (options.serviceGateway) {
            $.ajax(options.serviceGateway)
            .done(function(data) {
              options.headers = data;
              continueSettingOptions(); 
            })
            .fail(function(ex){
              alert("Failed to get setup data. The URL used was: " + options.serviceGateway);
              console.log(ex);
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
            var request = this.createRequest({url:url, type:'GET'});

            $.ajax(request).done(function (data) {
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
            this.debug(this.formFields);

            this.assetModel = Backbone.Model.extend({
                schema: this.formFields
            });

            var that = this;
            $('.new').click(function() {
                that.newAsset();
            });

            var selectFields = [];
            that.enumFields(function(key, field) {
                // TODO: hard-coded
                if (key != "Description" && field.sel !== false) {
                  selectFields.push(key);
                }
            });

            // Populate the assets list
            this.loadAssets(this.assetName, selectFields);

            var refreshList = $('#refreshList');
            refreshList.bind('click', function() {
                that.loadAssets(that.assetName, selectFields);
            });

            this.toggleNewOrEdit('new');
        };

        VersionOneAssetEditor.prototype._ajaxFail = function(ex) {
            console.log(ex);
        };

        VersionOneAssetEditor.prototype.loadAssets = function (assetName, selectFields) {
            var url = this.getAssetUrl(assetName) + '&' + $.param({
                'sel': selectFields.join(','),
                'page': '50,0' // TODO: temporary...
                ,'sort': '-ChangeDate'
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
                var href = $(this).attr('data-href');
                that.debug("Href: " + href);
                that.editAsset($(this).attr('data-href'));
            });
            return templ;
        };

        VersionOneAssetEditor.prototype.listItemPrepend = function(item) {
            var templ = this.listItemFormat(item);
            var assets = $("#assets");
            assets.prepend(templ);
            assets.listview('refresh');
        };

        VersionOneAssetEditor.prototype._normalizeIdWithoutMoment = function(item) {
            var id = item._links.self.id;
            this.debug("The id from server with moment: " + id);
            id = id.split(":");
            if (id.length == 3) {
                id.pop();
            }
            id = id.join(":");
            item._links.self.id = id;
            this.debug("Normalized id: " + id);
        };

        VersionOneAssetEditor.prototype.listItemReplace = function(item) {
            // Thanks to Moments:
            var id = item._links.self.id;    

            var templ = this.listItemFormat(item);
            var assets = $("#assets");    

            var that = this;
            assets.find("a[data-assetid='" + id + "']").each(function() {
                that.debug("Found a list item:");
                that.debug(this);
                var listItem = $(this);        
                //var newItem = that.listItemFormat(item);
                listItem.closest("li").replaceWith(templ);
            });
            assets.listview('refresh');
        };

        VersionOneAssetEditor.prototype.newAsset = function() {
            var asset = new this.assetModel();
            this.asset = asset;

            var form = new Backbone.Form({
                model: asset
            }).render();

            console.log (form);

            this.form = form;            
            $("#fields").html(form.el);

            this.configSelectLists();

            this.toggleNewOrEdit("new");
            this.changePage("#detail");
            this.resetForm();

            // Hardcoded:
            if (this.requestorName != "") {
                $("[name='RequestedBy']").val(this.requestorName);
                $("[name='Name']").focus();
            } else {
                $("[name='RequestedBy']").focus();
            }
        };

        VersionOneAssetEditor.prototype.configSelectLists = function(callback) {
            // Setup the data within select lists
            // TODO: this should not happen on EVERY new click.
            var that = this;
            $("select[data-class='sel']").each(function() {
                var item = $(this);
                var fieldName = item.attr("name");
                var field = that.findField(fieldName);
                var assetName = field.editorAttrs['data-assetName'];
                var fields = field.formFields;
                if (fields == null || fields.length == 0) {
                    fields = ['Name'];
                }

                var url = that.service + assetName + '?' + $.param(that.queryOpts) + '&'
                    + $.param({sel: fields.join(',')});
                var request = that.createRequest({url:url, type:'GET'});
                $.ajax(request).done(function (data) {
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
                  if (callback) {
                    callback();
                  }
                }).fail(this._ajaxFail);
            });
        };

        VersionOneAssetEditor.prototype.editAsset = function(href) {
            var url = this.host + href + '?' + $.param(this.queryOpts);
            var request = this.createRequest({url:url});
            var that = this;
            this.configSelectLists(function() {
                $.ajax(request).done(function(data) {
                    that.newAsset();
                    var modelData = that.form.getValue();
                    for (var key in modelData) {
                        var value = data[key];
                        if (value) {
                            that.form.setValue(key, data[key]);
                        }
                        else {
                            // TODO: need better way to do this
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
                                        var els = $("[name='" + key + "']");
                                        if (els.length > 0) {
                                            var select = $(els[0]);
                                            select.selectmenu();
                                            that._normalizeIdWithoutMoment(data);
                                            var id = data._links.self.id;
                                            that.debug(key + ": " + id);
                                            select.val(id);
                                            select.selectmenu('refresh', true);
                                        }
                                    }
                                }).fail(this._ajaxFail);
                            }
                        }
                    }
                    that.toggleNewOrEdit('edit', href);
                    that.changePage("#detail");
                }).fail(this._ajaxFail);
            });
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
                        that.debug("About to call newAsset");
                        that.newAsset();
                        // Hardcoded:
                        $("#Name").focus();
                    });
                });
            }
            else if (type == "edit") 
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
                        that.debug("edit:saveAndNew: about to call newAsset");
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
            this.requestorName = $("#RequestedBy").val();
            this.saveAsset(url, "assetCreated", callback);
        };

        VersionOneAssetEditor.prototype.on("assetCreated", function(that, asset) {
            toastr.success("New item created");        
            that._normalizeIdWithoutMoment(asset);
            that.listItemPrepend(asset);
        });

        VersionOneAssetEditor.prototype.updateAsset = function(href, callback) {      
            var url = this.host + href + '?' + $.param(this.queryOpts);
            this.debug(url);
            this.saveAsset(url, "assetUpdated", callback);
        };

        VersionOneAssetEditor.prototype.on("assetUpdated", function(that, asset) { 
            toastr.success("Save successful");
            that._normalizeIdWithoutMoment(asset);
            that.listItemReplace(asset);
        });

        VersionOneAssetEditor.prototype.saveAsset = function(url, eventType, callback) {

            var validations = this.form.validate();

            if (validations != null) {
                toastr.error("Please review the form for errors", null,
                            { positionClass: 'toast-bottom-right' });
                return;
            }

            var dto = this.createDto();

            this.clearErrors();

            var request = this.createRequest({
                url: url,
                type: 'POST',
                data: JSON.stringify(dto),
                contentType: this.contentType
            });
            var that = this;
            $.ajax(request).done(function(data) {
                that.debug("Ajax done: ");
                that.debug(data);
                if (callback) {
                    that.debug("About to call callback");
                    callback(data);
                }
                that.trigger(eventType, that, data);
            }).fail(this._ajaxFail);
        };

        VersionOneAssetEditor.prototype.createDto = function (addProjectIdRef) {
            if (addProjectIdRef !== false) {
                addProjectIdRef = true;
            }

            var dto = this.form.getValue();
            
            console.log(dto);

            window.DTO = dto;            

            dto._links = {
                Scope: {
                    idref: this.projectScopeId
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

        VersionOneAssetEditor.prototype.clearErrors = function() {
            $('.error').text('');
        };

        VersionOneAssetEditor.prototype.resetForm = function() {
            this.debug('resetForm');

            this.enumFields(function(key, field) {
                $("[name='" + key + "']").each(function() {
                    if (field.type != "select") {
                        $(this).val("");
                        $(this).textinput();
                    }
                });
            });
            // TODO: this is hard-coded
            var sel = $("[name='Priority']");
            sel.selectmenu();
            sel.val("RequestPriority:167");
            sel.selectmenu('refresh');
            //this.configureValidation();
        };

        VersionOneAssetEditor.prototype.enumFields = function(callback) {
            for(var key in this.formFields) {
                var field = this.formFields[key];
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

        return VersionOneAssetEditor;
    }
);