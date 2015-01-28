var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var net = require('net');

module.exports.startServer = function (config, configCallback, startCallback) {

	var params = config || {};
	var destDir = params.destDir || "dest";
	var serverPort = params.serverPort || 3000;
	var entryPoint = params.entryPoint || "index.html";

	// Set static folder
	app.use(express.static("./"+destDir));

	// Point / to entry point
	app.get('/', function(req, res) {
	    res.sendFile(entryPoint, { root: destDir });
	});

	// If we have extra config, call it before
	if(configCallback) {
		
		configCallback(app, function () {	
			startServer(server, serverPort, startCallback);
		});

	} else {
		startServer(server, serverPort, startCallback);
	}
}

// Start the server
function startServer(server, port, callback) {

	io.on('connection', function(socket){
		console.log('a user connected');
	});

	server.listen(port);

	var client = net.connect({port: 5001, host: 'localhost'}, function (conn) {
		console.log("Listening to BLE service on 5001");
	});

	client.on('data', function (data) {
		console.log("Data received from BLE", data.toString());
	});

	client.on('end', function () {
		console.log("Disconnected from BLE service");
	});

	callback();
}