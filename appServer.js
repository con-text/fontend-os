var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routes = require('./server/appServerRoutes.js');
var config = require('./config/config');
var backendSocket = require('socket.io-client')(config.baseApiUrl);

app.use(config.allowAppsOrigin);
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', routes.root);
app.get('/app/:uuid/:appId', routes.getApp);
app.get('/app/:uuid/:appId/states/:objectId', routes.getAppWithObject);
app.post('/users/:uuid/apps/:appId/states', routes.createState);
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

// Create socket server
var io = require('socket.io')(server);

var clients = {};
var currentUser;
var socketIdToObject = {};
var currentObjects = {};

backendSocket.on('connect', function(){
	console.log("Connected to backend backendSocket");
});

backendSocket.on('disconnect', function(){
    //backend disconects, wipe the connection so that
    console.log("Backend has disconnected");
    currentUser = null;
});

backendSocket.on('syncedState', function(msg){
	//got syncedState from the server, send to the saved object
    if(currentObjects[msg.objectId]){
        currentObjects[msg.objectId].emit('syncedState', msg);
    }
    else{
        console.log("Object doesn't exist in currentObjects");
    }
});



function socketCanRun(){
    return (!!currentUser);
}

backendSocket.on('sendInitialFromBackend', function(msg){

    if(!msg.objectId || !msg.state){
        console.log("Message from backend is missing object id or state", msg.objectId, msg.state);
        return;
    }
    if(!currentObjects[msg.objectId]){
        console.log("The entry for object", msg.objectId,"doesn't exist");
        return;
    }
    console.log("Filling for object", msg.objectId);
    currentObjects[msg.objectId].emit('fillData', msg.state);
});


// Need to define something using
io.on('connection', function(socket){
	socket.on('stateChange', function(msg){
		backendSocket.emit('stateChange',
			{	uuid: msg.uuid, objectId: msg.objectId, action:msg.action,
				path: msg.path, property: msg.property, value: msg.value});
	});

  backendSocket.on('notification', function(notification) {
    socket.emit('notification', notification);
  });

	socket.on('getInitial', function(msg){
        //new object has joined the room, check that it doesn't already exist
        if(currentObjects[msg.objectId]){
            console.log("state already exists in the object");
            return;
        }
        //create the mappings between objectid and socketid
        //the socketIdToObject will be used on disconnect
        console.log("Creating entry for",msg.objectId);

        var packet = {uuid: msg.uuid, objectId: msg.objectId, socketId: socket.id};
		backendSocket.emit('requestInitialFromBackend', packet);


        currentObjects[msg.objectId] = socket;
        socketIdToObject[socket.id] = msg.objectId;

	});

  socket.on('disconnect', function() {
      //if this exists, its an object, otherwise its the connection from 5000
      if(socketIdToObject[socket.id]){
          console.log("Removing",socketIdToObject[socket.id]);
          delete currentObjects[socketIdToObject[socket.id]];
          delete socketIdToObject[socket.id];
      }

  });

  socket.on('initRoom', function(data) {
      //logged into the system, let the backend know so that it can map
      //uuid to a socket object
      if(data.uuid){
          console.log("Joining",data.uuid);
          backendSocket.emit('initRoom', {uuid: data.uuid});
          currentUser = data.uuid;
      }
      else{
          console.log("UUID didn't exist in the ");
      }
  });

  socket.on('leaveRoom', function() {
      backendSocket.emit('leaveRoom', {uuid: currentUser});
      console.log("Leave room");
  });
});
