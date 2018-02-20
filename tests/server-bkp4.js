var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var URL 	= require('url-parse');

app.get('/eureka', function(req, res){
	var pageToVisit = "http://www2.zelo.com.br/";
	console.log('Visiting page ' + pageToVisit);
	
	//request(pageToVisit, {method: 'HEAD'}, function(error, response, body){
	request(pageToVisit, function(error, response, body){
		//console.log(response.statusCode);
		if(!error){
			res.writeHead(200, {'Content-Type': 'text/html'});
			// Parse the document body
			var $ = cheerio.load(body);
			res.write('<br> Page title:  ' + $('title').text());
		}
		else {
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.write('Error: ' + error);
			console.log('Error: ' + error);
		}
		res.write('<br><br>');
		res.write('Check your console!');
		res.end();
	})
})

app.listen('8088')
console.log('Magic happens on port 8088');
exports = module.exports = app;
