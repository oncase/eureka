var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/eureka', function(req, res){
  url = 'http://www.imdb.com/chart/top?ref_=nv_mv_250_6';

  request(url, function(error, response, body){
    if(!error){
      var $ = cheerio.load(body);

      var title, release, rating;
	  var jarray = [];
      var json = "";

      $('.lister-list tr').each(function(){
        title = $(this).find('.titleColumn a').text().trim();
		release = $(this).find('.titleColumn secondaryInfo').text().trim();
		rating = $(this).find('.imdbRating strong').text().trim();
		
		var item = {
			"title": title,
			"release": release,
			"rating": rating
		}
		
		jarray.push(item);
      })
    }

	json = JSON.stringify({
        movies: jarray
    },null,4);
	
	var jsonObj = JSON.parse(json);
    console.log("Json:" + jsonObj);
    console.log("Array length:" + jsonObj.movies.length);
	
    fs.appendFile('output3.json', json, function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

    res.send('Check your console!')
  })
})

app.listen('8088')
console.log('Magic happens on port 8088');
exports = module.exports = app;