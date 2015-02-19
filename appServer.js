var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./server/appServerRoutes.js');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', routes.root);
app.get('/app/:uuid/:appId', routes.getApp);
app.get('/syncState/:uuid/:appId', routes.syncGet);
app.post('/syncState/:uuid/:appId', routes.syncPost);

var server = app.listen(3001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
