var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var URL 	= require('url-parse');

var START_URL = "http://www2.zelo.com.br/";
var SEARCH_WORD = "Rodrigo";
var MAX_PAGES_TO_VISIT = 5000;
console.log('Start page ' + START_URL);

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var allProducts = [];

var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
console.log('Base Url:' + baseUrl);

var jarray = [];
var json = "";
var horaInicio = "";

function eureka() {
	if(numPagesVisited >= MAX_PAGES_TO_VISIT || pagesToVisit < 1) {
		if(pagesToVisit < 1) {
			console.log("No more pages to visit.");
		}
		else {
			console.log("Reached max limit of number of pages to visit: " + MAX_PAGES_TO_VISIT);
		}

		json = JSON.stringify({
			produtos: jarray
		},null,4);

		var jsonObj = JSON.parse(json);
		console.log("Json:" + jsonObj);
		console.log("Array length:" + jsonObj.produtos.length);

		fs.writeFile('produtos.json', json, function(err){
			console.log('File successfully written! - Check your project directory for the output.json file');
		})

		console.log("Início: "+horaInicio);
		console.log("Fim: "+getDateTime());

		return;
	}
  
  var nextPage = pagesToVisit.pop();
  //console.log("nextPage: " + nextPage);
  if (nextPage in pagesVisited) {
    // We've already visited this page, so repeat eureka
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
	
	request(url, function(error, response, body) {
		if(!error) {
			//Visited page with no error
			console.log("Visiting page "+numPagesVisited+": " + url);
			fs.appendFileSync('paginasvisitadas.csv', '"'+numPagesVisited+'"' + ';' + '"' + url + '"' + '\n');
			// Parse the document body
			var $ = cheerio.load(body);
		
			//var isWordFound = searchForWord($, SEARCH_WORD);
			//if(isWordFound) {
			//    console.log('Word ' + SEARCH_WORD + ' found at page ' + url);
			//}
			collectInternalLinks($);
			collectProducts($);
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
  var relativeLinks = $('a[href^="/"]');
  relativeLinks.each(function() {
	  pagesToVisit.push(baseUrl + $(this).attr('href'));
  });

  var absoluteLinks = $('a[href^="'+START_URL+'"]');
  absoluteLinks.each(function() {
	  pagesToVisit.push($(this).attr('href'));
  });
}

function collectProducts($) {
    var products = $('div[class^="info-side"]');
    products.each(function() {
		var data = $(this);
        var produto = data.find('#dsProductName').text().trim();
	    var preco = data.find('.text_preco_prod_listagem').first().text().trim();
		
		//console.log("produto:" + produto);
		//console.log("preco:" + preco);
		
		if (produto) {
			//if (produto in allProducts) {
			if (allProducts.includes(produto)) {
				//We already visited this product, so don't continue
				//console.log("Produto já listado:" + produto);
				return;
			}
			else {
				if (!preco) {
					preco = "Indisponível";
				}
				var item = {
					"produto": produto,
					"preco": preco
				}
				jarray.push(item);
				allProducts.push(produto);
				console.log(allProducts.length+" produto(s)");
			}
		}
	});
}

function getDateTime() {
    var date = new Date();
	
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

app.get('/eureka', function(req, res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<br> Start Page: ' + START_URL);
	res.write('<br> Base Url: ' + baseUrl);
	
	fs.writeFileSync('paginasvisitadas.csv', '"Numero";"Url"'+'\n','utf-8', function (err) {
		if (err) {
			console.log("");
			console.log("Failed to save");
			console.log("");
		} else {
			console.log("");
			console.log("Succeeded in saving");
			console.log("");
		}
	});
	
	horaInicio = getDateTime();
	console.log(getDateTime());
	
	pagesToVisit.push(START_URL);
	eureka();

	res.write('<br><br>');
	res.write('Executando...');
	res.write('<br><br>');
	res.write('Check your console!');
	res.end();
})

app.listen('8088')
console.log('Magic happens on port 8088');
console.log('');
exports = module.exports = app;
