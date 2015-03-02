var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./server/appServerRoutes.js');
var socketClient = require('socket.io-client')('http://contexte.herokuapp.com');

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', routes.root);
app.get('/app/:uuid/:appId', routes.getApp);
app.get('/object/:uuid/:objectId', routes.getObject);
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
	console.log("Got syncedState event", msg);
	for(var key in clients){
		if(clients.hasOwnProperty(key)){
			console.log("loooping through clients", clients[key].objectId, msg.objectId);
			if(msg.objectId != clients[key].objectId){
				continue;
			}
			if(key != msg.socketId){
				console.log("Sending to ")
				clients[key].emit('syncedState', msg);
			}
			else{
				console.log("Not sending to original sender");
			}
		}
	}
});



//need to define something using
io.on('connection', function(socket){

	clients[socket.id] = socket;
	// console.log('a user connected to the socket server', clients);
	// socketClient.emit('getInitialFromBackend', {uuid: msg.uuid, app: msg.app});

	socketClient.on('gotInitialFromBackend', function(msg){
		console.log("gotInitialFromBackend", msg);
		clients[msg.socketId].emit('fillData', msg.state);
		// socket.emit('fillData', msg.state);
	});


	socket.on('stateChange', function(msg){
		console.log("Got", msg, "from user in stateChange");
		socketClient.emit('stateChange',
			{	uuid: msg.uuid, objectId: msg.objectId, action:msg.action,
				path: msg.path, property: msg.property, value: msg.value, socketId: socket.id});
	});

	socket.on('getInitial', function(msg){
		var packet = {uuid: msg.uuid, objectId: msg.objectId, socketId: socket.id};
		clients[socket.id].objectId = msg.objectId;
		console.log("Got",msg,"from socket","sending",packet);
		socketClient.emit('getInitialFromBackend', packet);
	});

    socket.on('disconnect', function() {
        if(!!clients[socket.id]){
        	delete clients[socket.id];
        	console.log("Removed",socket.id,"from clients list");
        }
    });

});
