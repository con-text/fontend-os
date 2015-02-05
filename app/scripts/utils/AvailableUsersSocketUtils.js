var AvailableUsersActionCreators = require('../actions/AvailableUsersActionCreators');

// Initialize socket.io
var socket = io();

module.exports = {

  listenOverSocket: function() {

    socket.on('users', function (data) {
      // Invoke an action to update list of available users
      AvailableUsersActionCreators.updateUsers(data);
    });
  }
};
