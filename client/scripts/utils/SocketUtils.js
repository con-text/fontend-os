var SessionActionCreators        = require('../actions/SessionActionCreators');
var AvailableUsersActionCreators = require('../actions/AvailableUsersActionCreators');
var AppsActionCreators           = require('../actions/AppsActionCreators');
var NotificationActions          = require('../actions/NotificationActionCreators');
// Initialize socket.io
var socket = io();
var appServerSocket = io('http://localhost:3001');

module.exports = {

  listenOverSocket: function() {

    socket.on('users', function (data) {
      // Invoke an action to update list of available users
      AvailableUsersActionCreators.updateUsers(data);
    });

    socket.on('loginStatus', function(data) {
      if(data.result === 'success') {
        SessionActionCreators.finishAuthSuccess(data.userId);

        // Pass it back to apps server
        appServerSocket.emit('initRoom', {
          uuid: data.userId
        });

      } else if (data.result === 'fail') {
        SessionActionCreators.finishAuthFailed(data.userId);
      } else if (data.result === 'logout') {
        // Pass it back to apps server
        appServerSocket.emit('leaveRoom');
        return;
      }


    });

    appServerSocket.on('notification', function(notification) {

      var app = {
        id: notification.appId
      };

      var params = {
        objectId: notification.stateId
      };

      console.log("Going to open object id: " + params.objectId);

      // Create notification about sharing
      NotificationActions.createTextNotification("You now share this app with",

        // Bind action to open the app to the notification
        AppsActionCreators.open.bind(AppsActionCreators, app, params)
      );

    });
  }
};
