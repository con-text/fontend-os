var net = require('net');
var JsonSocket = require('json-socket');
var userApi = require('./server/users');

var socketPath = '/tmp/ble.sock';

module.exports.connectToBleService = function(io) {

  // Use UNIX socket
  var socket = new JsonSocket(new net.Socket());

  socket.connect(socketPath, function () {
    console.log("Listening to BLE service on " + socketPath);

    // Process message
    socket.on('message', function (message) {

      var users = message.clients;
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

        userApi.getUserProfile(user.id, function(userProfie) {
          availableUsers.push(userProfie);

          // Do we now have all users?
          if(availableUsers.length === users.length) {

            // Push new state to web socket
            io.emit('users', availableUsers);
          }
        });
      });
    });

  });

  socket.on('end', function () {
    // TODO: Add reconnection logic here
    console.log("Disconnected from BLE service");
  });

  socket.on('error', function(err) {
    console.log("Error during connection to the BLE servie", err);
  });

  return socket;
}
