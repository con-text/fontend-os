var SessionActionCreators        = require('../actions/SessionActionCreators');
var DesktopActionCreators         = require('../actions/DesktopActionCreators');
var AvailableUsersActionCreators = require('../actions/AvailableUsersActionCreators');
var AppsActionCreators           = require('../actions/AppsActionCreators');
var NotificationActions          = require('../actions/NotificationActionCreators');
// Initialize socket.io

var socket = io();
var appServerSocket = io('http://localhost:3001');
var SessionStore = require('../stores/SessionStore');
var SessionApiUtils = require('./SessionApiUtils');
var AppsApiUtils    = require('./AppsApiUtils');

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

      } else if (data.result === 'fileSuccess') {

        // File sharing success, all good
        DesktopActionCreators.toggleSearch(data.userId);

      } else if (data.result === 'fail') {
        SessionActionCreators.finishAuthFailed(data.userId);
      } else if (data.result === 'logout') {
        // Pass it back to apps server
        appServerSocket.emit('leaveRoom');
        return;
      }
    });

    appServerSocket.on('notification', function(notification) {

      console.log('Notification recived on client', notification);

      var app = {
        id: notification.appId
      };

      var params = {
        state: {id: notification.stateId}
      };

      app.state = params.state;

      //var uuid = SessionStore.getCurrentUser().uuid;
      var uuid = notification.userToShareId;

      console.log('Notification params', app, params.state.id, uuid);

      // Get full state object, as now we only have id
      AppsApiUtils.getState(uuid, app).done(function(state) {

        console.log('Notification found state', app, params.state.id, uuid);

        // Insert state into the app object
        //app.state = state;
        //app.state.id = state._id;
        params.state = state;
        params.state.id = state._id;

        // Get name of the user
        SessionApiUtils.getProfile(notification.userId).done(function(user) {

          console.log('Notification found user id', notification, state, user);

          // Create notification about sharing
          NotificationActions.createTextNotification(
            user.name + ' shared something with you',
            // Bind action to open the app to the notification
            AppsActionCreators.open.bind(AppsActionCreators, app, params)
          );

        });
      }).fail(function(err) {
        console.log('Failed to find the state', params.state.id, err);
      });
    });
  }
};
