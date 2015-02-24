var net = require('net');
var JsonSocket = require('json-socket');
var userApi = require('./server/users');
var keyMirror = require('keymirror');

var messageCodes = keyMirror({
  activePeripherals: null,
  loginStatus: null
});

var socketPath = '/tmp/ble.sock';

function processMessage(message, io) {

  // Grab the message code and take action
  if(message.code === messageCodes.activePeripherals) {
    handleActivePeripheralsMessage(io, message.data.clients);
  } else if(message.code == messageCodes.loginStatus) {
    handleLoginStatusMessage(io, message.data);
  } else {
    // Don't know this message code
    console.error("Unknown message code");
  }

  return;
}

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

function handleLoginStatusMessage(io, data) {
    io.emit('loginStatus', data);
}

module.exports.connectToBleService = function(io) {

  // Use UNIX socket
  var socket = new JsonSocket(new net.Socket());

  socket.connect(socketPath, function () {
    console.log("Started listening to BLE service on " + socketPath);

    // Process message
    socket.on('message', function(msg) { processMessage(msg, io); });

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
