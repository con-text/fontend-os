var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./server/appServerRoutes.js');
var socketClient = require('socket.io-client')('http://contexte.herokuapp.com');
var config = require('./config/config');

app.use(config.allowAppsOrigin);
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', routes.root);
app.get('/app/:uuid/:appId', routes.getApp);
app.get('/app/:uuid/:appId/states/:objectId', routes.getAppWithObject);
app.get('/users/:uuid/apps/:appId/states', routes.getOrCreateState);
app.get('/object/:uuid/:objectId', routes.getObject);

// Allow to serve assets, like css or images
app.get('/apps/:appName/:asset', function(req, res) {
  var appName = req.params.appName;
  var fileName = req.params.asset;

  res.sendFile(fileName, { root: './dist/apps/'+ appName + '/' });
});

// app.get('/syncState/:uuid/:appId', routes.syncGet);
// app.post('/syncState/:uuid/:appId', routes.syncPost);

var server = app.listen(3001, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

socketClient.on('connect', function(){
	console.log("Connected to backend socketClient");
});

socketClient.on('event', function(data){});
socketClient.on('disconnect', function(){});

var io = require('socket.io')(server);
var clients = {};

socketClient.on('syncedState', function(msg){
	for(var key in clients){
		if(clients.hasOwnProperty(key)){
			if(msg.objectId != clients[key].objectId){
				continue;
			}
			if(key != msg.socketId){
				clients[key].emit('syncedState', msg);
			}
		}
	}
});

// Need to define something using
io.on('connection', function(socket){

	clients[socket.id] = socket;

	socketClient.on('gotInitialFromBackend', function(msg){
		clients[msg.socketId].emit('fillData', msg.state);
	});

	socket.on('stateChange', function(msg){
		socketClient.emit('stateChange',
			{	uuid: msg.uuid, objectId: msg.objectId, action:msg.action,
				path: msg.path, property: msg.property, value: msg.value, socketId: socket.id});
	});

	socket.on('getInitial', function(msg){
		var packet = {uuid: msg.uuid, objectId: msg.objectId, socketId: socket.id};
		clients[socket.id].objectId = msg.objectId;
		socketClient.emit('getInitialFromBackend', packet);
	});

  socket.on('disconnect', function() {
      if(!!clients[socket.id]){
      	delete clients[socket.id];
      }
  });

  socket.on('initRoom', function(data) {
    console.log("Init room", data);
  });

  socket.on('leaveRoom', function() {
    console.log("Leave room");
  });
});
