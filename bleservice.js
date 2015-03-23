var net = require('net');
var JsonSocket = require('json-socket');
var userApi = require('./server/users');
var keyMirror = require('keymirror');

var messageCodes = keyMirror({
  activePeripherals: null,
  loginStatus: null
});

var socketPath = '/tmp/ble.sock';

function processMessage(app, message, io, sessionStore) {

  // Grab the message code and take action
  if(message.code === messageCodes.activePeripherals) {
    handleActivePeripheralsMessage(io, message.data.clients);
  } else if(message.code == messageCodes.loginStatus) {
    handleLoginStatusMessage(app, io, sessionStore, message.data);
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
    userApi.getUserProfile(user.id, function(userProfile) {
      userProfile.state = user.state;
      availableUsers.push(userProfile);

      // Do we now have all users?
      if(availableUsers.length === users.length) {
        // Push new state to web socket
        io.emit('users', availableUsers);
      }
    });
  });
}

function handleLoginStatusMessage(app, io, sessionStore, data) {

  var userId = data.userId;
  var sid = data.sid;

  // Stop propagating session id here
  data.sid = undefined;

  // Create express session
  if(data.result === 'success') {

    // Initiate the session
    sessionStore.get(sid, function(err, session) {
      session.user = {
        id: userId
      };
      sessionStore.set(sid, session);
      io.emit('loginStatus', data);
    });

  }
  else {

    sessionStore.get(sid, function(err, session) {
      session.user = null;

      io.emit('loginStatus', data);
    });

  }
}

module.exports.connectToBleService = function(app, io, sessionStore) {

  // Use UNIX socket
  var connecting;
  var socket = new JsonSocket(new net.Socket());

  connecting = true;
  socket.connect(socketPath);

  socket.on('connect', function () {
    console.info("BLE: Started listening to BLE service on " + socketPath);

    // Process message
    socket.on('message', function(msg) {
      processMessage(app, msg, io, sessionStore);
    });

    connecting = false;
  });

  socket.on('end', function () {
    console.info("BLE: connection end.");
  });

  socket.on('close', function () {
    console.info("BLE: Disconnected from BLE service");

    // Try to reconnect
    setTimeout(function() {
      console.info("BLE: Trying to reconnect...");
      socket.connect(socketPath);
    }, 2000);
  });

  socket.on('error', function(err) {
    console.error("BLE: " +  err.code + " Error during connection to the BLE servie");
  });

  return socket;
};
