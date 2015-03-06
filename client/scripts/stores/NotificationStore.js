var AppDispatcher = require('../dispatchers/AppDispatcher');

var NotificationConstants = require('../constants/NotificationConstants');
var ActionTypes = NotificationConstants.ActionTypes;

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

var CHANGE_EVENT = 'change';

var NotifactionStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this.notifications = [];
    this.currentNotification = null;
  },

  getAll: function() {
    return this.notifications;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

});

// Register with the dispatcher
NotifactionStore.dispatchToken = AppDispatcher.register(function(payload) {

  var action = payload.action;
  switch(action.type) {

    case ActionTypes.SHOW:
      NotifactionStore.notifications.push(action.notification);
      NotifactionStore.emitChange();
      break;
    case ActionTypes.DISMISS:
      var notificationId = action.id;
      var removed = _.remove(NotifactionStore.notifications, function(notif) {
          return notif.id === notificationId;
      });
      console.log("Dismissed", removed);
      NotifactionStore.emitChange();
      break;
    default:
      // No operation
      break;

  }
});

module.exports = NotifactionStore;
