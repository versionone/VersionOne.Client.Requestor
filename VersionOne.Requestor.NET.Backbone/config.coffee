define ['./fields'], (fields) ->
  showDebugMessages = true
  
  #var host = 'http://platform-dev';
  #var service = 'http://platform-dev/CustomerTest/rest-1.v1/Data/';
  #var versionOneAuth = 'admin:Admin101#';
  
  #var host = 'http://localhost';
  #var service = 'http://localhost/VersionOne.Web/rest-1.v1/Data/';
  #var versionOneAuth = 'admin:admin';

  host = "https://www12.v1host.com"
  service = "https://www12.v1host.com/ProofpointAPITest/rest-1.v1/Data/"
  versionOneAuth = "bstussy:Proofpoint!"
  serviceGateway = false
  
  #var serviceGateway = 'http://localhost/v1requestor/Setup';
  assetName = "Request"

  configureFields = (obj) ->
    for fieldGroupName, fieldGroup of obj
      for fieldName, field of fieldGroup
        if field.type == 'Select'
          field.options = [] # Ajax will fill 'em in
          field.editorAttrs =
            'data-class': 'sel'
            'data-assetName': field.assetName
            'data-rel': fieldName
        else
          if field.optional == true          
          else
            field.validators = ['required']
        if field.type == 'TextArea'
          field.editorAttrs =
            style: 'height:200px'
        if field.autofocus == true
          if not field.editorAttrs
            field.editorAttrs = {}
          field.editorAttrs.autofocus = 'autofocus'
        # Delete properties, if they exist, from field
        delete field.autofocus
        delete field.optional

  configureFields fields

  options =
    showDebug: showDebugMessages
    host: host
    service: service
    serviceGateway: serviceGateway
    versionOneAuth: versionOneAuth
    assetName: assetName
    formFields: fields

  return options
#
#   BooleanTest : {
#     title: 'This is a boolean',
#     type: 'Checkbox',
#     sel: false
#   },
#
