# Installing the Node.JS Sever Gateway

First, install Node.js from http://nodejs.org/

Then, from inside this folder, type `npm install`. This should install express and request inside a folder named `node_modules`

Next, edit the server.js file to configure the port you want the gateway server to listen on, plus the VersionOne username, password, and instance url.

Finally, type `node server.js`

You'll also have to modify the index.html in the main folder to point to this server's url so the JavaScript code knows where to send requests when users hit 'Submit'.