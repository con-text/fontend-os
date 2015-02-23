var net = require('net');
var JsonSocket = require('json-socket');
var userApi = require('./server/users');
var keyMirror = require('keymirror');

var MessageCodes = keyMirror({
  activePeripherals: null,
  loginStatus: null
});


var socketPath = '/tmp/ble.sock';

function handleActivePeripheralsMessage(io, users) {

  var availableUsers = [];

  // Send empty list
  if(users.length === 0) {
    // Push new state to web socket
    io.emit('users', []);
  }

  // Match IDs to user data
  users.forEach(function (user) {
    userApi.getUserProfile(user.id, function(userProfie) {
      availableUsers.push(userProfie);

      // Do we now have all users?
      if(availableUsers.length === users.length) {
        // Push new state to web socket
        io.emit('users', availableUsers);
      }
    });
  });
}

module.exports.connectToBleService = function(io) {

  // Use UNIX socket
  var socket = new JsonSocket(new net.Socket());

  socket.connect(socketPath, function () {
    console.log("Listening to BLE service on " + socketPath);

    // Process message
    socket.on('message', function (message) {
      console.log(message);
      // Grab the message code
      var code = message.code;

      switch(code) {

          case MessageCodes.activePeripherals:
            handleActivePeripheralsMessage(io, message.data.clients);
            break;

          case MessageCodes.loginStatus:
            console.log("Login status", message.data);
            break;

          default:
            // Don't know this message code
            break;
      }
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
};
