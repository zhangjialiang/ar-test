var app = require('express')();
var fs = require('fs');
var url=require('url');
var mine=require('./mine').types;
var path=require('path');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('private.pem', 'utf8');
var certificate = fs.readFileSync('file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

var reFunc = function (request, response) {
  var pathname = request.url;
  //var realPath = path.join("assets", pathname);
  realPath = __dirname + pathname;
  console.log(realPath);
  var ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  fs.exists(realPath, function (exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });

      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
    } else {
      fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end(err);
        } else {
          var contentType = mine[ext] || "text/plain";
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, "binary");
          response.end();
        }
      });
    }
  });
}

var PORT = 18080;
var SSLPORT = 18081;

httpServer.listen(PORT, function() {
  console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function() {
  console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

//// Welcome
app.get('*', function(req, res) {
  reFunc(req, res);
});