var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var START_URL = "http://www2.zelo.com.br/";
var SEARCH_WORD = "Rodrigo";
var MAX_PAGES_TO_VISIT = 100;
console.log('Start page ' + START_URL);

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var nextPage = "";
var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
console.log('Base Url:' + baseUrl);

pagesToVisit.push(START_URL);
crawl();

function crawl() {
  if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
    console.log("Reached max limit of number of pages to visit: " + MAX_PAGES_TO_VISIT);
    return;
  }
  nextPage = pagesToVisit.pop();
  console.log("nextPage: " + nextPage);
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat the crawl
    crawl();
  } else {
    // New page we haven't visited
    visitPage(nextPage, crawl);
  }
}

function visitPage(url, callback) {
  // Add page to our set
  pagesVisited[url] = true;
  numPagesVisited++;

  // Make the request
  console.log("Visiting page " + url);
  request(url, function(error, response, body) {
    if(!error) {
		// Parse the document body
		var $ = cheerio.load(body);
		
		var isWordFound = searchForWord($, SEARCH_WORD);
		if(isWordFound) {
		    console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
		}
			collectInternalLinks($);
		    // In this short program, our callback is just calling crawl()
			callback();
	} else {
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

  var relativeLinks = $("a[href^='/']");
  console.log("Found " + allRelativeLinks.length + " relative links on page");
  relativeLinks.each(function() {
      allRelativeLinks.push($(this).attr('href'));
	  pagesToVisit.push(baseUrl + $(this).attr('href'));
  });

  var absoluteLinks = $("a[href^='http']");
  console.log("Found " + allAbsoluteLinks.length + " absolute links on page");
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
	  pagesToVisit.push(baseUrl + $(this).attr('href'));
  });
}
