function V1RequestorConfig (backendType) {
    var projectName = "'System (All Projects)'";
    var contentType = "haljson";

    var config = {
        getProjectIdOnClient: true,
        projectName: projectName,
        projectScopeId: null,
        host: "http://platform-dev",
        service: "http://platform-dev/CustomerTest/rest-1.v1/Data/",
        contentType: contentType,
        queryOpts: {
            acceptFormat: contentType
        },
        headers: {
            Authorization: "Basic " + btoa("admin:admin")
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
    
    if (backendType == "c#") {
        config.getProjectIdOnClient = false;
        config.host = "http://localhost:53448";
        config.service = config.host + "/";
    }

    return config;
}

var config = V1RequestorConfig("c#");

var setupApp = function() {
    var createStory = function() {
        var dtoResult = createDto();
        if (dtoResult[0] == true) {
            return;
        }
        clearErrors();
        var dto = dtoResult[1];
        var url = config.service + "Request/Create" + "?" + $.param(config.queryOpts);
        return $.ajax( {
            url: url,
            headers: config.headers,
            type: "POST",
            data: JSON.stringify(dto),
            contentType: config.contentType
        }).done(function(data) {
            var item;
            console.log(data);
            item = $("<div></div>");
            item.html($("#requestItemTemplate").render(data));
            return $("#output").prepend(item);
        });
    };
    
    var createDto = function() {
        var data = $("#requestForm").trigger("submitForm");
        if ( ! data) {
            return[true, null];
        }
        var attributes;
        attributes = {};
        var hasError = false;
        $("#requestForm .inputField").each(function() {
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
                idref: config.projectScopeId
            }
        };
        return[hasError, attributes];
    };
    
    var clearErrors = function() {
        $(".error").text("");
    };
    var resetForm = function() {
      $("#requestForm")[0].reset();
    };
    $("#run").click(createStory);
    $("#reset").click(resetForm);
};

function getProjectScopeIdRef(done) {
    if (!config.getProjectScopeIdRef) {
        config.projectScopeId = "";
        return;
    }
    var url = config.service + "Scope" + "?where=" + $.param(config.whereCriteria) 
        + "&" + $.param(config.whereParams);
    $.ajax( {
        url: url,
        headers: config.headers,
        type: "GET",
        
    }).done(function(data) {
        projectScopeId = data._links.self.id;
        if (done) {
            done();
        }
    });
}
var init = function() {
    $("#requestForm").html($("#fieldsTemplate").render( {
        fields: config.fields
    }));
    $("#requestForm").validVal();
    getProjectScopeIdRef(setupApp);
    setupApp();
};
$(init);