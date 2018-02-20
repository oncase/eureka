var http = require('http');
var fs = require('fs');

http.createServer(function(request, response){
    console.log(request.method, request.url);
    if (request.method === 'GET' && request.url === '/') {
    fs.readFile('template.html', function(err, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
    }
    else if (request.method === 'GET' && request.url === '/test') {
    fs.readFile('template2.html', function(err, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
    }
}).listen(8081);
