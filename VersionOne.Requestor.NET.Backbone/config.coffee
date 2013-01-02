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
  projectName = "'System (All Projects)'"
  assetName = "Request"
  
  options =
    showDebug: showDebugMessages
    projectName: projectName
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
