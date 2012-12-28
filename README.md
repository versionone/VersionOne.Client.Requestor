VersionOne.Requestor.NET
========================

VersionOne Requestor sample app using .NET or Node.js on the backend and jQuery Mobile JSON on the front-end.

# How to use directly against a VersionOne instance

First, if you want to run this against a VersionOne hosted instace, please contact VersionOne because it depends on a few 'experimental' dlls that we have to install for you.

If you have your own instance installed on premise, still contact us since we have not updated documentation for installing it yourself yet.

1. Clone this repo locally
2. Create a new web site using IIS, or perhaps another web server, that points to the `VersionOne.Request.NET` folder.
3. Inside of `index.html`, change the top to point to your own instance with the correct host, service url, auth, and project name:

```javascript
$(document).ready(function () {
    //var host = "http://platform-dev";
    //var service = "http://platform-dev/CustomerTest/rest-1.v1/Data/";
    //var versionOneAuth = "admin:Admin101#";
    
    /*** Set your info here: ***/
    var host = "http://localhost";
    var service = "http://localhost/VersionOne.Web/rest-1.v1/Data/";
    var versionOneAuth = "admin:admin";
    var projectName = "'System (All Projects)'";

    var showDebugMessages = true;
```

4. Finally, assuming you created a web site named `V1Requestor` on a server named `InternalProjectServer`, you should be able to browse to `http://InternalProjectServer/V1Requestor/index.html`

# How to use with a service gateway

Did you see those credentials embedded in JavaScript above? Yes, that could suck. We're looking at better ways to enable this to work from the web browser, but we also have a way to proxy the request through a "service gateway", but we don't have instructions for that yet. You can see a C# version and a Node.js version in the source code of the project, however. Contact us if you would like to use these features.

