# Installing the Node.JS Sever Gateway

First, install Node.JS from http://nodejs.org/

Then, from inside this folder, type `npm install`. This should install express and request inside a folder named `node_modules`

Next, edit the server.js file to configure the post you want the server to listen on, plus the VersionOne username, password, and instance url.

Finally, type `node server.js`

You'll also have to modify the index.html to point to this server's url.