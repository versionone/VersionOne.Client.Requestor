// Settings
var showDebugMessages = true;
var port = 8020;
var versionOneUrl = 'http://localhost/VersionOne.Web';
var versionOneUser = 'admin';
var versionOnePassword = 'admin';

// Application
var express = require('express');
var request = require('request');
var app = express();

app.configure(function(){
	app.use(express.bodyParser());
});

app.post('/Request', function(req, res){
	var auth = 'Basic ' + new Buffer(versionOneUser + ':' + versionOnePassword).toString('base64');
	var requestDto = req.body;
	if (showDebugMessages)
		console.log(requestDto);
	request({
		url: versionOneUrl + '/rest-1.v1/Data/Request?acceptFormat=haljson',
		method: 'POST',
		headers: { Authorization: auth, Accept: 'haljson', 'Content-type': 'haljson' },
		jar: false,
		body: JSON.stringify(requestDto)
	}, function(err, remoteResponse, body) {
		if (showDebugMessages)
			console.log(body);
		if (!err) {
			res.send(body);
		}
		else {
			res.send(err);
		}
	});	
});

app.listen(port);
console.log("Listening for VersionOne Request submissions at port " + port);