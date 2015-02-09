var net = require('net');
var userApi = require('./server/users');

module.exports.connectToBleService = function(io) {

  // Use UNIX socket
  var socket = net.connect('/tmp/ble.sock', function (conn) {
    console.log("Listening to BLE service.");
  });

  socket.on('data', function (data) {

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

  socket.on('end', function () {
    // TODO: Add reconnection logic here
    console.log("Disconnected from BLE service");
  });

  socket.on('error', function(err) {
    console.log("Error during connection to the BLE servie", err);
  });

  return socket;
}
