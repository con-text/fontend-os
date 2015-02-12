var applications = require('./server/apps.js');
var express = require('express');
var app = express();


app.get('/', function (req, res) {
	console.log(applications);
	console.log(applications.getApps());
	var appIds = [];
	applications.getApps().forEach(function(m){
		appIds.push(m.id);
	});
  res.json(appIds);
});

var appExists = function(id){
	var found = false;
	var index = -1;
	applications.getApps().forEach(function(m,idx){
		if(m.id == id){
			found = true;
			index = idx;
			return;
		}
	});
	return {found:found, index: index};
}

app.get('/app/:id', function(req,res){
	console.log(req.params);
	// var id = req.body.id;
	var realApp = appExists(req.params.id);
	if(realApp.found){
		// console.log(applications.getApps()[realApp.index].reactClass);
		// res.send("m");
		res.send(applications.getApps()[realApp.index].renderReact());
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