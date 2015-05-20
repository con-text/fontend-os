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
var redisConfig = require('./config/redis');

// Unix socket to BLE
var bleSocket;
var sessionStore = new session.MemoryStore();

// Add support for cmd+a, cmd+c, cmd+v
var gui = require('nw.gui');

if (process.platform === "darwin") {
  var mb = new gui.Menu({type: 'menubar'});
  mb.createMacBuiltin('Nimble', {
		hideWindow: true
  });
  gui.Window.get().menu = mb;
}

function configAndStartServer(config) {

	var params = config || {};
	var destDir = params.destDir || "dest";
	var serverPort = params.serverPort || 5000;
	var entryPoint = params.entryPoint || "index.html";

	// Run config
	configFile.configure(app, express, io, sessionStore);

	// Initialize connection to BLE
	bleSocket = ble.connectToBleService(app, io, sessionStore);

	var redisClient = redisConfig.configureRedisPublisher();

	// Load other routes
	fs.readdirSync("./server").forEach(function(file) {
		var component = require(path.join(process.cwd(), 'server', file));

		// If the required module can add any route handlers, let it do so
		if(component.routeHandler) {
			component.routeHandler(app, io, bleSocket, redisClient);
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

	var killChildProcess = function() {
		child.kill();
	};

	// On ctrl-c exit
	process.on( 'SIGINT', function() {
		console.log( "\nShutting down - SIGINT (Ctrl-C)" );

	 	// Close BLE service bleSocket
		bleSocket.end();

	 	// some other closing procedures go here
		process.exit();

		// Close app server
		killChildProcess();
	});

	process.on('SIGTERM', killChildProcess);
	process.on('uncaughtException', killChildProcess);
}

// If called from command line
var serverConfig = {
	serverPort: 5000
};

configAndStartServer(serverConfig);
