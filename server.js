var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var net = require('net');
var path = require('path');
var fs = require('fs');
var ble = require('./bleservice');
var configFile = require('./config/config');
var spawn = require('child_process').spawn;
var session = require('express-session');

// Unix socket to BLE
var socket;
var sessionStore = new session.MemoryStore();

function configAndStartServer(config) {

	var params = config || {};
	var destDir = params.destDir || "dest";
	var serverPort = params.serverPort || 5000;
	var entryPoint = params.entryPoint || "index.html";

	// Run config
	configFile.configure(app, express, io, sessionStore);

	// Initialize connection to BLE
	socket = ble.connectToBleService(app, io, sessionStore);

	// Load other routes
	fs.readdirSync("./server").forEach(function(file) {
		var component = require(path.join(process.cwd(), 'server', file));

		// If the required module can add any route handlers, let it do so
		if(component.routeHandler) {
			component.routeHandler(app, socket);
		}
	});


	// Point / to entry point
	app.get('/', function(req, res) {
			res.sendFile(entryPoint, { root: './'+destDir });
	});

	startServer(server, serverPort);
}

// Start the server
function startServer(server, port) {

	// Listen to the TCP port
	server.listen(port, function() {
		if(typeof(window) !== 'undefined') {
			window.location = 'http://localhost:' + port;
		}
	});

	// Start app server
	var child = spawn('node', ['appServer.js'], {
		stdio: 'inherit'
	});

	// On ctrl-c exit
	process.on( 'SIGINT', function() {
		console.log( "\nShutting down - SIGINT (Ctrl-C)" );

	 	// Close BLE service socket
		socket.end();

	 	// some other closing procedures go here
		process.exit();

		// Close app server
		child.kill('SIGINT');
	});
}

// If called from command line
var serverConfig = {
	serverPort: 5000
};

configAndStartServer(serverConfig);
