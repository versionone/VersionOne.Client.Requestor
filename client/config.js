// Generated by CoffeeScript 1.6.2
(function() {
  define(['./fields'], function(fields) {
    var assetName, configureFields, host, options, projectListClickTarget, service, serviceGateway, showDebugMessages, versionOneAuth;

    showDebugMessages = true;
    host = 'http://tranquil-garden-8382.herokuapp.com/pt/https://www14.v1host.com';
    service = host + '/v1sdktesting/rest-1.v1/Data/';
    versionOneAuth = 'admin:admin';
    serviceGateway = false;
    assetName = "Request";
    projectListClickTarget = 'new';
    configureFields = function(obj) {
      var field, fieldGroup, fieldGroupName, fieldName, _results;

      _results = [];
      for (fieldGroupName in obj) {
        fieldGroup = obj[fieldGroupName];
        _results.push((function() {
          var _results1;

          _results1 = [];
          for (fieldName in fieldGroup) {
            field = fieldGroup[fieldName];
            if (field.type === 'Select') {
              field.options = [];
              field.editorAttrs = {
                'data-class': 'sel',
                'data-assetName': field.assetName,
                'data-rel': fieldName
              };
            } else {
              if (field.optional === true) {

              } else {
                field.validators = ['required'];
              }
            }
            if (field.type === 'TextArea') {
              field.editorAttrs = {
                style: 'height:200px'
              };
            }
            if (field.autofocus === true) {
              if (!field.editorAttrs) {
                field.editorAttrs = {};
              }
              field.editorAttrs.autofocus = 'autofocus';
            }
            delete field.autofocus;
            _results1.push(delete field.optional);
          }
          return _results1;
        })());
      }
      return _results;
    };
    configureFields(fields);
    options = {
      showDebug: showDebugMessages,
      host: host,
      service: service,
      serviceGateway: serviceGateway,
      versionOneAuth: versionOneAuth,
      assetName: assetName,
      formFields: fields,
      projectListClickTarget: projectListClickTarget
    };
    return options;
  });

}).call(this);
