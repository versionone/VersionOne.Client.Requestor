var bodyParser = require('body-parser');
var httpntlm = require('httpntlm');
var express = require('express');
var app = express();
var cors = require('cors');

var username = 'v1admin';
var password = 'v1admin#$';
var workstation = '';
var domain = '';

app.use(bodyParser.text({ type : 'application/xml' }));
app.use(cors());

function getUrl(url) {
    //remove the initial slash    
    return url.substr(4, url.length - 4);
}

function getHeaders(headers) {
    var result = {};
    for (h in headers) {
        if (h == 'host' || h == 'origin' || h == 'referer' || h == 'accept-encoding')
            continue;
        result[h] = headers[h];
    }
    return result;
}

function addHeaders(response, headers) {
    for (h in headers) {
        response.setHeader(h, headers[h]);
    }
}

function responseError(response, msg) {
    response.type('application/json; charset=utf-8');
    var error = { error: msg };
    response.end(JSON.stringify(error));
}

app.get('/pt/*', function (req, res, next) {
    try {
        var url = getUrl(req.url);
        var options = {
            url: url,
            method: 'GET',
            username: username,
            password: password,
            domain: domain,
            workstation: workstation,
            headers: getHeaders(req.headers)
        };
        
        httpntlm.get(options, function (error, response) {
            if (error) throw error.message;
            addHeaders(res, getHeaders(response.headers));
            res.end(response.body);
        });
    } catch (exception) {
        responseError(res, exception);
    }
});

app.post('/pt/*', function (req, res, next) {
    try {
        var options = {
            url: getUrl(req.url),
            method: 'POST',
            username: username,
            password: password,
            domain: domain,
            workstation: workstation,            
            body: req.body,
            headers: getHeaders(req.headers)
        };
        
        httpntlm.post(options, function (error, response) {
            if (error) throw error.message;
            addHeaders(res, getHeaders(response.headers));
            res.status(200).send(response.body);
        });
    } catch (exception) {
        responseError(res, exception);
    }
    
});

var port = Number(process.env.PORT || 5000);

app.use(express.static(__dirname + '/client'));

app.listen(port, function () {
    console.log('CORS Proxy listening on port ' + port);
});