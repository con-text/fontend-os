var applications = require('./server/apps.js');
var applicationList = applications.getApps();
var express = require('express');
var app = express();
var httpGet = require('http-get');
var http = require('http');
http.post = require('http-post');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
	var appIds = [];
	applicationList.forEach(function(m){
		appIds.push(m.id);
	});
  res.json(appIds);
});

var appExists = function(id){
	var found = false;
	var index = -1;
	applicationList.forEach(function(m,idx){
		if(m.id == id){
			found = true;
			index = idx;
			return;
		}
	});
	return {found:found, index: index};
};

app.get('/app/:uuid/:appId', function(req,res){
	console.log(req.params);
	var uuid = req.params.uuid;
	var appId = req.params.appId;
	// var id = req.body.id;
	var realApp = appExists(appId);


	userExists(uuid, function(exists, result){
		if(exists){
			//not too bothered about the user info at this point
			if(realApp.found){
				res.send(applicationList[realApp.index].mainPage);
			}
			else{
				res.send("App doesn't exist");
			}

		}
		else{
			res.json({message: "User doesn't exist"});
		}
	});


});

function userExists(uuid, callback){
	httpGet.get("https://contexte.herokuapp.com/users/"+uuid, function(err, result){
		console.log(err);
		if(err){
			//user probably doesn't exist, can change this depending on header
			callback(false, err);
		}
		else{
			//not too bothered about the user info at this point
			callback(true, result);
		}
	});
}

app.post('/syncState/:uuid/:appId', function(req,res){
	// console.log(req.params);
	// console.log(req.body);
	var uuid = req.params.uuid;
	var appId= req.params.appId;
	console.log("entering state sync post method", req.body);
	userExists(uuid, function(exists, result){
		if(exists){
			//change to https
			http.post("http://contexte.herokuapp.com/app/syncState/"+uuid+"/"+appId, req.body, function(response){
				res.json({message:"Sending update"});
			});
		}
		else{
			res.json({message: "User doesn't exist"});
		}
	});
});

app.get('/syncState/:uuid/:appId', function(req,res){
	var uuid = req.params.uuid;
	var appId= req.params.appId;
	console.log("entering statesync fetch method");
	userExists(uuid, function(exists,result){
		if(exists){
			//get the values, change to https soon
			httpGet.get("http://contexte.herokuapp.com/app/syncState/"+uuid+"/"+appId, function(err,result){
				if(err){
					res.json({"message": "error "+err});
				}
				else{
					console.log("results", result);
					var parsedResult = JSON.parse(result.buffer);
					console.log("parsed result", parsedResult);
					res.json(parsedResult);
				}
			});
		}
		else{
			res.json({message: "User doesn't exist"});
		}
	});
});

var server = app.listen(3001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
