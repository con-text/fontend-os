var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var net = require('net');
var path = require('path');
var fs = require('fs');

module.exports.startServer = function (config, additionalConfig) {

	var params = config || {};
	var destDir = params.destDir || "dest";
	var serverPort = params.serverPort || 3000;
	var entryPoint = params.entryPoint || "index.html";

	// Set static folder
	app.use(express.static("./"+destDir));

	// Load other routes
	var normalizedPath = path.join(__dirname, "server");

	fs.readdirSync(normalizedPath).forEach(function(file) {
		var component = require("./server/" + file);

		// If the required module can add any route handlers, let it do so
		if(component.routeHandler) {
			component.routeHandler(app);
		}
	});

	// Point / to entry point
	app.get('/', function(req, res) {
	    res.sendFile(entryPoint, { root: './'+destDir });
	});

	// If we have extra config, call it before
	if(additionalConfig) {

		additionalConfig(app, function () {
			startServer(server, serverPort);
		});
	} else {
		startServer(server, serverPort);
	}
};

// Start the server
function startServer(server, port) {

	io.on('connection', function(socket){
		console.log('a user connected');
	});

	server.listen(port);

	var client = net.connect({port: 5001, host: 'localhost'}, function (conn) {
		console.log("Listening to BLE service on 5001");
	});

	client.on('data', function (data) {

		var availability = JSON.parse(data);
		var users = availability.clients;
		var availableUsers = [];

		// Send empty list
		if(users.length === 0) {
			// Push new state to web socket
			io.emit('users', []);
		}

		// Match IDs to user data
		users.forEach(function (user) {

			if(user.status == "disconnected") {
				return;
			}

			getUserProfile(user.id, function(userProfie) {
				availableUsers.push(userProfie);

				// Do we now have all users?
				if(availableUsers.length === users.length) {

					// Push new state to web socket
					io.emit('users', availableUsers);
				}
			});
		});
	});

	client.on('end', function () {
		console.log("Disconnected from BLE service");
	});

	client.on('error', function(err) {
		console.log("Error during connection to the BLE servie", err);
	});


	process.on( 'SIGINT', function() {
		console.log( "\nShutting down - SIGINT (Ctrl-C)" );

	 	// Close BLE service socket
	 	client.end();

	 	// some other closing procedures go here
		process.exit();
	});
}

// If called from command line
if(require.main === module) {

	var serverConfig = {
		destDir: "dist",
		serverPort: 5000,
		entryPoint: "index.html"
	};

	module.exports.startServer(serverConfig);
}
