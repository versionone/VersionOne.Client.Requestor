function VersionOneRequestor (hasBackend, host, service, serviceGateway, versionOneAuth) {
    this.hasBackend = hasBackend;
    this.host = host;
    this.serice = service;
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
    if (this.hasBackend) {
        this.setup();
        return;
    }
    var url = this.config.service + "Scope" + "?where=" + $.param(this.config.whereCriteria)
        + "&" + $.param(this.config.whereParams);
    var that = this;
    $.ajax({
        url: url,
        headers: this.config.headers,
        type: "GET"
    }).done(function (data) {
        that.config.projectScopeId = data._links.self.id;
        that.setup();
    }).fail(function (ex) { console.log(ex); });
};

VersionOneRequestor.prototype.setup = function () {
    if (this.hasBackend) {
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

/*
    $(document).on('pagebeforechange', function(event, ui) {
        console.log(event);
        console.log(ui);
    });
*/
};

VersionOneRequestor.prototype.createStory = function () {
    var dtoResult = this.createDto();
    if (dtoResult[0] == true) {
        return;
    }
    this.clearErrors();
    var dto = dtoResult[1];
    var url = this.config.service + "Request" + "?" + $.param(this.config.queryOpts);
    var request = {
        url: url,
        type: "POST",
        data: JSON.stringify(dto),
        contentType: this.config.contentType
    };
    if (!this.hasBackend) {
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