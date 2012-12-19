function VersionOneRequestor (useServiceGateway, host, service, serviceGateway, versionOneAuth) {
    this.useServiceGateway = useServiceGateway;
    this.host = host;
    this.service = service;
    this.versionOneAuth = versionOneAuth;
    this.serviceGateway = serviceGateway;
    this.config();
    this.initializeThenSetup();
}

VersionOneRequestor.prototype.config = function () {
    var projectName = "'System (All Projects)'";
    var contentType = "haljson";
        
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
            Authorization: "Basic " + btoa(this.versionOneAuth) // TODO: clean this up
        },
        whereCriteria: {
            Name: projectName
        },
        whereParams: {
            acceptFormat: contentType,
            sel: ""
        },
        fields:
            [
                {
                    name: "RequestedBy",
                    label: "Requested By",
                    required: true,
                    autofocus: "autofocus",
                    placeholder: "Your name",
                    def: ""
                }, {
                    name: "Name",
                    required: true,
                    placeholder: "Brief request title",
                    label: "Title",
                    autofocus: "",
                    def: ""
                }, {
                    name: "Description",
                    label: "Description",
                    placeholder: "Give enough detail to aid follow-up conversations",
                    required: false,
                    autofocus: "",
                    def: "",
                    type: "textarea",
                    height: 200
                }
            ]
    };
};

VersionOneRequestor.prototype.initializeThenSetup = function () {
    if (this.useServiceGateway) {
        this.setup();
        return;
    }
    var url = this.config.service + "Scope" + "?where=" + $.param(this.config.whereCriteria)
        + "&" + $.param(this.config.whereParams);
    console.log("initializeThenSetup: " + url);
    var that = this;
    $.ajax({
        url: url,
        headers: this.config.headers,
        type: "GET"
    }).done(function (data) {
        if (data.length > 0) {
            that.config.projectScopeId = data[0]._links.self.id;
            that.setup();
        } 
        else {
            console.log("No results for query: " + url);
        }
    }).fail(function (ex) { console.log(ex); });
};

VersionOneRequestor.prototype.setup = function () {
    if (this.useServiceGateway) {
        this.config.host = this.config.serviceGateway;
        this.config.service = this.config.host + "/";
    }

    $("#requestForm").html($("#fieldsTemplate").render({
        fields: this.config.fields
    }));
    $("#requestForm").validVal();

    var that = this;
    $("#run").click(function () {
        that.createStory();
    });
    $("#reset").click(function () {
        that.resetForm();
    });

    // Populate the all requests list
    this.loadAllRequests();    

    $(document).on('pagebeforechange', function(event, ui) {
        console.log(ui.toPage["0"].id);
    });
};

VersionOneRequestor.prototype.loadAllRequests = function () {
    console.log("loadAllRequests");
    var url = this.getRequestUrl() + "&" + $.param({ 
        'sel': 'Name,RequestedBy'
    });
    console.log("loadAllRequests: " + url);
    var request = { url: url };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    var that = this;
    $.ajax(request).done(function(data) {
        console.log(data);
        for(var i = 0; i < data.length; i++) {
            var item = data[i];
            var templ = $("<li></li>");
            templ.html($("#requestItemTemplate").render(item));
            var link = templ.children(".requestItem").bind("click", function() {
                that.editRequest($(this).attr("data-href"));
            });
            $("#requests").append(templ);
        }        
        $("#requests").listview("refresh");
    }).fail(function(ex) { console.log(ex); });    
};

VersionOneRequestor.prototype.getRequestUrl = function() {
    var url = this.config.service + "Request" + "?" + $.param(this.config.queryOpts);
    return url;
};

VersionOneRequestor.prototype.editRequest = function(href) {
    var url = this.config.host + href + "?" + $.param(this.config.queryOpts);
    var request = { url: url };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    $.ajax(request).done(function(data) {
        console.log(data);
        $.mobile.changePage("#new");
        $("#Name").val(data.Name);
        $("#RequestedBy").val(data.RequestedBy);
        $("#Description").val(data.Description);
    }).fail(function(ex) { console.log(ex); });
};

VersionOneRequestor.prototype.createStory = function () {
    var dtoResult = this.createDto();
    if (dtoResult[0] == true) {
        return;
    }
    this.clearErrors();
    var dto = dtoResult[1];
    var url = this.getRequestUrl();
    var request = {
        url: url,
        type: "POST",
        data: JSON.stringify(dto),
        contentType: this.config.contentType
    };
    if (!this.useServiceGateway) {
        request.headers = this.config.headers;
    }
    return $.ajax(request).done(function(data) {
        console.log(data);
        var item;
        item = $("<div></div>");
        item.html($("#requestItemTemplate").render(data));
        return $("#output").prepend(item);
    }).fail(function(ex) { console.log(ex); });
};

VersionOneRequestor.prototype.createDto = function () {
    var data = $("#requestForm").trigger("submitForm");
    if (!data) {
        return [true, null];
    }
    var attributes;
    attributes = {};
    var hasError = false;
    $("#requestForm .inputField").each(function () {
        var el;
        el = $(this);
        var id = el.attr("id");
        var val = el.val();
        var required = el.attr("data-required");
        if (required == "true" && (val == null || val == "undefined" || val == "")) {
            hasError = true;
            var error = $("#err" + id);
            var label = error.attr("data-label");
            error.text(label + " is required");
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
    
VersionOneRequestor.prototype.clearErrors = function() {
    $(".error").text("");
};

VersionOneRequestor.prototype.resetForm = function() {
    $("#requestForm")[0].reset();
};