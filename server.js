var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var sheet=require('./sheetsApi.js');


app.get('/data/sheet/:id', function(req, res){
	sheet.fetchSheet(req.params.id,function (err,data){
		var response={};
		if(err){
			if(err.code){
				res.send(err); // because if sheet is not found google api returns a proper json for error
			}else{
				// Error in connection
				response.status=false;
				response.code=504;
				response.message=err;
				res.send(response); 
			}
		}else{
			response.status=true;
			response.code=200;
			response.message=data;
			res.json(response);
		}
	})
})

app.listen('8084')
console.log('Your Site is up on port 8084');
exports = module.exports = app;
