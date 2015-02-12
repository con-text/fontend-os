var applications = require('./server/apps.js');
var applicationList = applications.getApps();
var express = require('express');
var app = express();


app.get('/', function (req, res) {
	var appIds = [];
	applicationList.getApps().forEach(function(m){
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
}

app.get('/app/:uuid/:appid', function(req,res){
	console.log(req.params);
	var uuid = req.params.uuid;
	var appid = req.params.appid;
	// var id = req.body.id;
	var realApp = appExists(appid);

	
	
	if(realApp.found){
		res.send(applicationList[realApp.index].mainPage);
	}
	else{
		res.send("App doesn't exist");
	}
});

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})