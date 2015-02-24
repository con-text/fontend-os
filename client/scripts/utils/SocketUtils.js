var SessionActionCreators        = require('../actions/SessionActionCreators');
var AvailableUsersActionCreators = require('../actions/AvailableUsersActionCreators');

// Initialize socket.io
var socket = io();

module.exports = {

  listenOverSocket: function() {

    socket.on('users', function (data) {
      // Invoke an action to update list of available users
      AvailableUsersActionCreators.updateUsers(data);
    });

    socket.on('loginStatus', function(data) {
      if(data.result === 'success') {
        SessionActionCreators.finishAuthSuccess(data.userId);
      } else if (data.result === 'fail') {
        SessionActionCreators.finishAuthFailed(data.userId);
      } else {
        console.error("Unexpected message type: " + data);
      }
    });
  }
};
