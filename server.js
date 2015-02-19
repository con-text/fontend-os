var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var net = require('net');
var path = require('path');
var fs = require('fs');
var ble = require('./bleservice');
var configFile = require('./config/config');

function configAndStartServer(config) {

	var params = config || {};
	var destDir = params.destDir || "dest";
	var serverPort = params.serverPort || 5000;
	var entryPoint = params.entryPoint || "index.html";

	// Run config
	configFile.configure(app, express);

	// Load other routes
	fs.readdirSync("./server").forEach(function(file) {
		var component = require(path.join(process.cwd(), 'server', file));

		// If the required module can add any route handlers, let it do so
		if(component.routeHandler) {
			component.routeHandler(app);
		}
	});

	// Point / to entry point
	app.get('/', function(req, res) {
			res.sendFile(entryPoint, { root: './'+destDir });
	});

	startServer(server, serverPort);
};

// Start the server
function startServer(server, port) {


	// Initialize web-socket
	io.on('connection', function(socket){
		console.log('a user connected');
	});

	// Initialize connection to BLE
	var socket = ble.connectToBleService(io);

	// Listen to the TCP port
	server.listen(port, function() {
		if(typeof(window) !== 'undefined') {
			window.location = 'http://localhost:' + port;
		}
	});
	// On ctrl-c exit
	process.on( 'SIGINT', function() {
		console.log( "\nShutting down - SIGINT (Ctrl-C)" );

	 	// Close BLE service socket
		socket.end();

	 	// some other closing procedures go here
		process.exit();
	});
}

// If called from command line
var serverConfig = {
	serverPort: 5000
};

configAndStartServer(serverConfig);
