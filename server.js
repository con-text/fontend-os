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
	    res.sendFile(entryPoint, { root: './'+destDir });
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

var userInfo = {};
userInfo['0001'] = {name: 'Benji', profilePic: 'http://placehold.it/50'};
userInfo['0002'] = {name: 'Denis', profilePic: 'http://placehold.it/50'};
userInfo['0003'] = {name: 'Ethan', profilePic: 'http://placehold.it/50'};
userInfo['0004'] = {name: 'Maciej', profilePic: 'http://placehold.it/50'};

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

		var availability = JSON.parse(data);
		var users = availability.clients;
		var availableUsers = [];

		// Match IDs to user data
		users.forEach(function (user) {

			if(user.status == "disconnected") {
				return;
			}

			var info = userInfo[user.id] || userInfo[0];
			user.profilePic = info.profilePic;
			user.name = info.name;
			availableUsers.push(user);
		});

		// Push new state to web socket
		io.emit('users', availableUsers);
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
	 	client.end()

	 	// some other closing procedures go here
		process.exit();
	});

	callback();
}
