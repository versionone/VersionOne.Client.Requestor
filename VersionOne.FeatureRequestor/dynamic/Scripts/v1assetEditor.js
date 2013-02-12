// Generated by CoffeeScript 1.3.3
(function() {

  define(["backbone", "underscore", "toastr", "jquery", "jquery.mobile", "jsrender"], function(Backbone, _, toastr, $) {
    var VersionOneAssetEditor, debug, debugEnabled, error, info, log, qs, success;
    log = function(message) {
      return console.log(message);
    };
    error = function(message) {
      return toastr.error(message);
    };
    success = function(message) {
      return toastr.success(message);
    };
    info = function(message) {
      return toastr.info(message);
    };
    qs = function(queryString, key) {
      var match;
      key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&");
      match = queryString.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
      return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    };
    debug = function(message) {
      if (debugEnabled) {
        return console.log(message);
      }
    };
    $.fn.pressEnter = function(fn) {
      return this.each(function() {
        $(this).bind("enterPress", fn);
        return $(this).keyup(function(e) {
          if (e.keyCode === 13) {
            return $(this).trigger("enterPress");
          }
        });
      });
    };
    $("#projectsPage").live("pageinit", $('#bodyDiv').css('visibility', 'visible').hide().fadeIn('slow'));
    VersionOneAssetEditor = (function() {

      function VersionOneAssetEditor(options) {
        var contentType, continueSettingOptions, debugEnabled,
          _this = this;
        continueSettingOptions = function() {
          var key;
          options.whereParamsForProjectScope = {
            acceptFormat: contentType,
            sel: ""
          };
          options.queryOpts = {
            acceptFormat: contentType
          };
          options.contentType = contentType;
          for (key in options) {
            _this[key] = options[key];
          }
          return _this.initialize();
        };
        contentType = "haljson";
        debugEnabled = options.showDebug;
        if (options.serviceGateway) {
          $.ajax(options.serviceGateway).done(function(data) {
            options.headers = data;
            return continueSettingOptions();
          }).fail(function(ex) {
            error("Failed to get setup data. The URL used was: " + options.serviceGateway);
            return log(ex);
          });
        } else {
          options.headers = {
            Authorization: "Basic " + btoa(options.versionOneAuth)
          };
          continueSettingOptions();
        }
      }

      VersionOneAssetEditor.prototype.debug = function(message) {
        if (this.showDebug) {
          return log(message);
        }
      };

      VersionOneAssetEditor.prototype.initialize = function() {
        var selectFields,
          _this = this;
        this.requestorName = "";
        this.refreshFieldSet("default");
        $(".new").click(function() {
          return _this.newAsset();
        });
        selectFields = [];
        this.enumFields(function(key, field) {
          if (key !== "Description" && field.sel !== false) {
            return selectFields.push(key);
          }
        });
        this.selectFields = selectFields;
        $("#list").live("pageinit", this.configureListPage);
        $("#list").live("pagebeforeshow", function() {
          return _this.listFetchIfNotLoaded();
        });
        $("#projectsPage").live("pagebeforeshow", function() {
          return _this.setTitle("Projects");
        });
        this.on("assetCreated", function(that, asset) {
          success("New item created");
          that._normalizeIdWithoutMoment(asset);
          that._normalizeHrefWithoutMoment(asset);
          return that.listItemPrepend(asset);
        });
        this.on("assetUpdated", function(that, asset) {
          success("Save successful");
          that._normalizeIdWithoutMoment(asset);
          that._normalizeHrefWithoutMoment(asset);
          return that.listItemReplace(asset);
        });
        this.configureProjectSearch();
        return this.toggleNewOrEdit("new");
      };

      VersionOneAssetEditor.prototype.refreshFormModel = function() {
        return this.assetFormModel = Backbone.Model.extend({
          schema: this.getFormFields()
        });
      };

      VersionOneAssetEditor.prototype.listFetchIfNotLoaded = function() {
        if (!this._listLoaded) {
          return this.loadRequests();
        }
      };

      VersionOneAssetEditor.prototype.configureProjectSearch = function() {
        var ajaxRequest, projectSearch, searchTerm,
          _this = this;
        searchTerm = null;
        ajaxRequest = null;
        projectSearch = $("#projectSearch");
        projectSearch.pressEnter(function(e) {
          var assetName, projects, request, target, url;
          target = $(e.currentTarget);
          if (searchTerm === target.val()) {
            return;
          }
          searchTerm = target.val();
          if (searchTerm.length < 4) {
            return;
          }
          $.mobile.loading('show');
          if (ajaxRequest) {
            ajaxRequest.abort();
          }
          assetName = "Scope";
          url = _this.getAssetUrl(assetName) + "&" + $.param({
            sel: "Name",
            page: "100,0",
            find: "'" + searchTerm + "'",
            findin: "Name"
          });
          request = _this.createRequest({
            url: url
          });
          projects = $("#projects");
          return ajaxRequest = $.ajax(request).done(function(data) {
            var val, _i, _len;
            ajaxRequest = null;
            projects = $("#projects").empty();
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              val = data[_i];
              _this.projectItemAppend(val);
            }
            projects.listview("refresh");
            return $.mobile.loading('hide');
          }).fail(_this._ajaxFail);
        });
        return this.loadProjectIfPassedOnQueryString();
      };

      VersionOneAssetEditor.prototype.loadProjectIfPassedOnQueryString = function() {
        var projectId, scopeOid;
        if (window.location.href.indexOf("#list?") > -1) {
          projectId = qs(window.location.href, "projectId");
          if (projectId != null) {
            scopeOid = projectId;
            if (scopeOid.indexOf("Scope:") !== 0) {
              scopeOid = "Scope:" + scopeOid;
            }
            return this.loadRequests(scopeOid, false);
          }
        } else if (window.location.href.indexOf("#detail?") > -1) {
          projectId = qs(window.location.href, "projectId");
          if (projectId != null) {
            scopeOid = projectId;
            if (scopeOid.indexOf("Scope:") !== 0) {
              scopeOid = "Scope:" + scopeOid;
            }
            this.setProject(scopeOid);
            return this.newAsset();
          }
        }
      };

      VersionOneAssetEditor.prototype.configureListPage = function() {
        var assets;
        assets = $("#assets");
        assets.empty();
        assets.listview();
        return this._listLoaded = false;
      };

      VersionOneAssetEditor.prototype._ajaxFail = function(ex) {
        console.log("Error: ");
        return console.log(ex);
      };

      VersionOneAssetEditor.prototype.setProject = function(projectIdref) {
        this.projectIdref = projectIdref;
        this.refreshFieldSet(projectIdref);
        return this._listLoaded = false;
      };

      VersionOneAssetEditor.prototype.loadRequests = function(projectIdref) {
        var assets, request, url,
          _this = this;
        this._listLoaded = true;
        if (!(projectIdref != null)) {
          projectIdref = this.projectIdref;
        } else {
          this.setProject(projectIdref);
        }
        url = this.getAssetUrl(this.assetName) + "&" + $.param({
          where: "Scope='" + projectIdref + "'",
          sel: "Name,RequestedBy",
          page: "75,0",
          sort: "-ChangeDate"
        });
        request = this.createRequest({
          url: url
        });
        assets = $("#assets");
        assets.empty();
        $.ajax(request).done(function(data) {
          var i, item, _i, _len;
          info("Found " + data.length + " requests");
          for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
            item = data[i];
            _this.listAppend(item);
          }
          return assets.listview("refresh");
        }).fail(this._ajaxFail);
        return this.changePage("#list");
      };

      VersionOneAssetEditor.prototype.refreshFieldSet = function(fieldSetName) {
        if (this.formFields[fieldSetName] != null) {
          this.fieldSetName = fieldSetName;
        } else {
          this.fieldSetName = "default";
        }
        return this.refreshFormModel();
      };

      VersionOneAssetEditor.prototype.getFormFields = function() {
        return this.formFields[this.fieldSetName];
      };

      VersionOneAssetEditor.prototype.getFormFieldsForSelectQuery = function() {
        var fields, fieldsClause;
        fields = [];
        this.enumFields(function(key) {
          return fields.push(key);
        });
        fields = fields.join(",");
        fieldsClause = $.param({
          sel: fields
        });
        return fieldsClause;
      };

      VersionOneAssetEditor.prototype.listAppend = function(item) {
        var assets, templ;
        assets = $("#assets");
        templ = this.listItemFormat(item);
        return assets.append(templ);
      };

      VersionOneAssetEditor.prototype.listItemFormat = function(item) {
        var templ,
          _this = this;
        templ = $("<li></li>");
        templ.html($("#assetItemTemplate").render(item));
        templ.children(".assetItem").bind("click", function(e) {
          var href, target;
          target = $(e.currentTarget);
          href = target.attr("data-href");
          return _this.editAsset(target.attr("data-href"));
        });
        return templ;
      };

      VersionOneAssetEditor.prototype.projectItemAppend = function(item) {
        var projects, templ;
        projects = $("#projects");
        templ = this.projectItemFormat(item);
        return projects.append(templ);
      };

      VersionOneAssetEditor.prototype.projectItemFormat = function(item) {
        var templ,
          _this = this;
        templ = $("<li></li>");
        templ.html($("#projectItemTemplate").render(item));
        templ.children(".projectItem").bind("click", function(e) {
          var idref, name, target;
          target = $(e.currentTarget);
          idref = target.attr("data-idref");
          name = target.attr("data-name");
          _this.setTitle(name);
          _this.setProject(idref);
          if (_this.projectListClickTarget === "new") {
            return _this.newAsset();
          } else {
            return _this.loadRequests();
          }
        });
        return templ;
      };

      VersionOneAssetEditor.prototype.setTitle = function(title) {
        return $(".title").text(": " + title);
      };

      VersionOneAssetEditor.prototype.listItemPrepend = function(item) {
        var assets, templ;
        templ = this.listItemFormat(item);
        assets = $("#assets");
        assets.prepend(templ);
        return assets.listview("refresh");
      };

      VersionOneAssetEditor.prototype._normalizeIdWithoutMoment = function(item) {
        var id;
        id = item._links.self.id;
        id = id.split(":");
        if (id.length === 3) {
          id.pop();
        }
        id = id.join(":");
        return item._links.self.id = id;
      };

      VersionOneAssetEditor.prototype._normalizeHrefWithoutMoment = function(item) {
        var href;
        href = item._links.self.href;
        if (href.match(/\D\/\d*?\/\d*$/)) {
          href = href.split("/");
          href.pop();
          href = href.join("/");
          return item._links.self.href = href;
        }
      };

      VersionOneAssetEditor.prototype.listItemReplace = function(item) {
        var assets, id, templ;
        id = item._links.self.id;
        templ = this.listItemFormat(item);
        assets = $("#assets");
        assets.find("a[data-assetid='" + id + "']").each(function() {
          var listItem;
          listItem = $(this);
          return listItem.closest("li").replaceWith(templ);
        });
        return assets.listview("refresh");
      };

      VersionOneAssetEditor.prototype.newAsset = function(modelData, href) {
        var _this = this;
        return this.configSelectLists().done(function() {
          var asset, form;
          asset = null;
          if (modelData != null) {
            asset = new _this.assetFormModel(modelData);
          } else {
            asset = new _this.assetFormModel();
          }
          _this.asset = asset;
          form = new Backbone.Form({
            model: asset
          }).render();
          _this.form = form;
          _this.trigger("assetFormCreated", _this.form);
          $("#fields").html(form.el);
          if (modelData != null) {
            _this.toggleNewOrEdit("edit", href);
          } else {
            _this.toggleNewOrEdit("new");
          }
          _this.changePage("#detail");
          if (!modelData) {
            _this.resetForm();
          }
          return $("#detail").trigger("create");
        });
      };

      VersionOneAssetEditor.prototype.configSelectLists = function() {
        var ajaxRequest, ajaxRequests, assetName, field, fields, key, model, promise, request, selectLists, url, value, _i, _len,
          _this = this;
        promise = new $.Deferred();
        ajaxRequests = [];
        model = new this.assetFormModel().schema;
        selectLists = [];
        for (key in model) {
          value = model[key];
          if (value.type === "Select" ? value.options.length < 1 : void 0) {
            selectLists.push(value);
          }
        }
        for (_i = 0, _len = selectLists.length; _i < _len; _i++) {
          field = selectLists[_i];
          assetName = field.editorAttrs["data-assetName"];
          fields = field.formFields;
          if (!(fields != null) || fields.length === 0) {
            fields = ["Name"];
          }
          url = this.service + assetName + "?" + $.param(this.queryOpts) + "&" + $.param({
            sel: fields.join(","),
            sort: "Order"
          });
          request = this.createRequest({
            url: url,
            type: "GET"
          });
          ajaxRequest = $.ajax(request).done(function(data) {
            var option, _j, _len1, _results;
            if (data.length > 0) {
              _results = [];
              for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
                option = data[_j];
                _results.push(field.options.push({
                  val: option._links.self.id,
                  label: option.Name
                }));
              }
              return _results;
            } else {
              return _this.debug("No results for query: " + url);
            }
          }).fail(this._ajaxFail);
          ajaxRequests.push(ajaxRequest);
        }
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
        return $.when.apply($, ajaxRequests).then(function() {
          return promise.resolve();
        });
      };

      VersionOneAssetEditor.prototype.editAsset = function(href) {
        var asset, fields, fieldsClause, url,
          _this = this;
        fields = this.getFormFields();
        url = this.host + href + "?" + $.param(this.queryOpts);
        fieldsClause = this.getFormFieldsForSelectQuery();
        url += "&" + fieldsClause;
        asset = this.createFetchModel(url);
        return asset.exec().done(function() {
          var id, key, links, model, modelData, rel, val, value;
          modelData = {};
          model = new _this.assetFormModel().schema;
          links = asset.get('_links');
          for (key in model) {
            value = asset.get(key);
            if (value != null) {
              if (fields[key].type === 'Date') {
                value = new Date(Date.parse(value));
              }
              modelData[key] = value;
            } else {
              rel = links[key];
              if (!(rel != null)) {
                continue;
              }
              val = links[key];
              if ((val != null) && val.length > 0) {
                val = val[0];
                id = val.idref;
                modelData[key] = id;
              }
            }
          }
          return _this.newAsset(modelData, href);
        }).fail(this._ajaxFail);
      };

      VersionOneAssetEditor.prototype.toggleNewOrEdit = function(type, href) {
        var save, saveAndNew,
          _this = this;
        save = $("#save");
        saveAndNew = $("#saveAndNew");
        if (type === "new") {
          save.unbind("click");
          save.bind("click", function(evt) {
            evt.preventDefault();
            return _this.createAsset(_this.assetName, function(asset) {
              return _this.editAsset(asset._links.self.href);
            });
          });
          saveAndNew.unbind("click");
          return saveAndNew.bind("click", function(evt) {
            evt.preventDefault();
            return _this.createAsset(_this.assetName, function() {
              _this.newAsset();
              return $("#Name").focus();
            });
          });
        } else if (type === "edit") {
          save.unbind("click");
          save.bind("click", function(e) {
            e.preventDefault();
            return _this.updateAsset(href);
          });
          saveAndNew.unbind("click");
          return saveAndNew.bind("click", function(e) {
            e.preventDefault();
            return _this.updateAsset(href, function() {
              return _this.newAsset();
            });
          });
        }
      };

      VersionOneAssetEditor.prototype.createRequest = function(options) {
        if (!this.serviceGateway) {
          options.headers = this.headers;
        }
        return options;
      };

      VersionOneAssetEditor.prototype.createFetchModel = function(url) {
        var fetchModel, options, props;
        options = {};
        if (!this.serviceGateway) {
          options.headers = this.headers;
        }
        props = {
          url: url,
          exec: function() {
            return this.fetch(options);
          }
        };
        fetchModel = Backbone.Model.extend(props);
        return new fetchModel();
      };

      VersionOneAssetEditor.prototype.createAsset = function(assetName, callback) {
        var url;
        url = this.getAssetUrl(assetName);
        return this.saveAsset(url, "assetCreated", callback);
      };

      VersionOneAssetEditor.prototype.updateAsset = function(href, callback) {
        var url;
        url = this.host + href + "?" + $.param(this.queryOpts);
        return this.saveAsset(url, "assetUpdated", callback);
      };

      VersionOneAssetEditor.prototype.saveAsset = function(url, eventType, callback) {
        var dto, request, validations,
          _this = this;
        validations = this.form.validate();
        if (validations != null) {
          error("Please review the form for errors", null, {
            positionClass: "toast-bottom-right"
          });
          return;
        }
        dto = this.createDto();
        debug("Dto:");
        debug(dto);
        request = this.createRequest({
          url: url,
          type: "POST",
          data: JSON.stringify(dto),
          contentType: this.contentType
        });
        return $.ajax(request).done(function(data) {
          _this.trigger(eventType, _this, data);
          if (callback) {
            return callback(data);
          }
        }).fail(this._ajaxFail);
      };

      VersionOneAssetEditor.prototype.createDto = function() {
        var dto;
        dto = this.form.getValue();
        dto._links = {
          Scope: {
            idref: this.projectIdref
          }
        };
        $("#fields select").each(function() {
          var el, id, relationAssetName, val;
          el = $(this);
          id = el.attr("name");
          val = el.val();
          relationAssetName = el.attr("data-rel");
          if (relationAssetName) {
            dto._links[relationAssetName] = {
              idref: val
            };
            return delete dto[id];
          }
        });
        return dto;
      };

      VersionOneAssetEditor.prototype.getAssetUrl = function(assetName) {
        var url;
        url = this.service + assetName + "?" + $.param(this.queryOpts);
        return url;
      };

      VersionOneAssetEditor.prototype.changePage = function(page) {
        return $.mobile.changePage(page);
      };

      VersionOneAssetEditor.prototype.resetForm = function() {
        this.enumFields(function(key, field) {
          return $("[name='" + key + "']").each(function() {
            if (field.type !== "select") {
              $(this).val("");
              return $(this).textinput();
            }
          });
        });
        return 'sel = $("[name=\'Priority\']")\nsel.selectmenu()\nsel.val "RequestPriority:167"\nsel.selectmenu "refresh"';
      };

      VersionOneAssetEditor.prototype.enumFields = function(callback) {
        var field, key, _ref, _results;
        _ref = this.getFormFields();
        _results = [];
        for (key in _ref) {
          field = _ref[key];
          _results.push(callback(key, field));
        }
        return _results;
      };

      VersionOneAssetEditor.prototype.findField = function(fieldName) {
        var addField, fields, index;
        fields = [null];
        index = 0;
        addField = function(key, field) {
          if (key === fieldName) {
            return fields[index++] = field;
          }
        };
        this.enumFields(addField);
        return fields[0];
      };

      return VersionOneAssetEditor;

    })();
    debugEnabled = false;
    _.extend(VersionOneAssetEditor.prototype, Backbone.Events);
    return VersionOneAssetEditor;
  });

}).call(this);
