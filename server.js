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
userInfo[1] = {name: "Denis Ogun", profilePic: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xaf1/v/t1.0-1/c117.0.320.320/p320x320/10561716_10154371608580398_1960362993738660566_n.jpg?oh=9d78ab899178310e5c2d3550a301ad63&oe=55247EE3&__gda__=1432709649_2c918b463cadac79835032700d5c0bb4"};
userInfo['40f24d2ecb59485c87d78f3a343a4433'] = {name: "Benji Barash", profilePic: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpa1/v/t1.0-1/c66.66.828.828/s111x111/558327_10152053694060381_1768235030_n.jpg?oh=9210147efc3f92684b9335cf22c64e5d&oe=55636B3F&__gda__=1428290679_638b26126cbe5ceb8381055a5ef5f1cf"};
userInfo[3] = {name: "Ethan Katzenberg", profilePic: "https://media.licdn.com/mpr/mpr/shrink_100_100/p/1/005/09f/0f1/2d8692d.jpg"};

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
