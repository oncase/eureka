var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var URL 	= require('url-parse');

var START_URL = "http://www2.zelo.com.br/";
var SEARCH_WORD = "Rodrigo";
var MAX_PAGES_TO_VISIT = 100000;
console.log('Start page ' + START_URL);

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var nextPage = "";
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
console.log('Base Url:' + baseUrl);

function eureka() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit: " + MAX_PAGES_TO_VISIT);
    return;
  }
  if(pagesToVisit < 1) {
    console.log("No more pages to visit.");
    return;
  }
  nextPage = pagesToVisit.pop();
  //console.log("nextPage: " + nextPage);
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the eureka
    eureka();
  } else {
    // New page we haven't visited
    visitPage(nextPage, eureka);
  }
}

function visitPage(url, callback) {
	// Add page to our set
	pagesVisited[url] = true;
	numPagesVisited++;
	
	console.log("Visiting page "+numPagesVisited+": " + url);
	fs.appendFileSync('paginasvisitadas-1.csv', '"'+numPagesVisited+'"' + ';' + '"' + url + '"' + '\n');
	
	request(url, function(error, response, body) {
		if(!error) {
			// Parse the document body
			var $ = cheerio.load(body);
		
			//var isWordFound = searchForWord($, SEARCH_WORD);
			//if(isWordFound) {
			//    console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
			//}
			collectInternalLinks($);
		    // In this short program, our callback is just calling eureka()
			callback();
		} else {
			//console.log(error);
			callback();
			return;
		}
	});
}

function searchForWord($, word) {
  var bodyText = $('html > body').text().toLowerCase();
  return(bodyText.indexOf(word.toLowerCase()) !== -1);
}

function collectInternalLinks($) {
  var allRelativeLinks = [];
  var allAbsoluteLinks = [];

  var relativeLinks = $('a[href^="/"]');
  relativeLinks.each(function() {
      allRelativeLinks.push($(this).attr('href'));
	  pagesToVisit.push(baseUrl + $(this).attr('href'));
  });

  var absoluteLinks = $('a[href^="'+START_URL+'"]');
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
	  pagesToVisit.push($(this).attr('href'));
  });
  
  //console.log("Found " + allRelativeLinks.length + " relative links on page");
  //console.log("Found " + allAbsoluteLinks.length + " absolute links on page");
}

app.get('/eureka', function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<br> Start Page: ' + START_URL);
	res.write('<br> Base Url: ' + baseUrl);
	
	pagesToVisit.push(START_URL);
	eureka();

	res.write('<br><br>');
	res.write('Check your console!');
	res.end();
})

app.listen('8088')
console.log('Magic happens on port 8088');
console.log('');
exports = module.exports = app;
