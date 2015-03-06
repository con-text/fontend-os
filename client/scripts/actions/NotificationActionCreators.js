var uuid = require('node-uuid');

var AppDispatcher         = require('../dispatchers/AppDispatcher');
var NotificationConstants = require('../constants/NotificationConstants');

var ActionTypes = NotificationConstants.ActionTypes;

var NotificationActionCreators = {

  createTextNotification: function(text) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SHOW,
      notification: {
        text: text,
        id: uuid.v1()
      }
    });
  },

  dismiss: function(notification) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.DISMISS,
      id: notification.id
    });
  }
};

module.exports = NotificationActionCreators;
