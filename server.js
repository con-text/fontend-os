var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var net = require('net');
var rest = require('restler');

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

function getUserProfile(userId, callback) {
	var baseUrl = 'http://contexte.herokuapp.com';

	//   // Assume we get this id
	  var id = "EA8F2A44";

	// Call the service
	rest.get(baseUrl + '/fetchUserInfo/' + id).on('complete', function(data) {
		callback(data);
	});
}


app.get('/user/:userId/profile', function(req, res) {

	var userId = req.params.userId;

	getUserProfile(userId, function(data) {
			res.json(data);
	});

});

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
	 	client.end()

	 	// some other closing procedures go here
		process.exit();
	});

	if(callback) {
		callback();
	}
}
