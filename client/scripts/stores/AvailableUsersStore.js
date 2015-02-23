var AvailableUsersDispatcher = require('../dispatchers/AvailableUsersDispatcher');
var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var ActionTypes = AvailableUsersConstants.ActionTypes;

var CHANGE_EVENT = 'change';

var _availableUsers = [];

var AvailableUsersStore = assign({}, EventEmitter.prototype, {

  getAvailable: function() {
      return _availableUsers;
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
  },

});

// Register the store with the dispatcher
AvailableUsersStore.dispatchToken = AvailableUsersDispatcher.register(function(payload) {

  var action = payload.action;

  switch(action.type) {

    case ActionTypes.USERS_UPDATED:
      _availableUsers = action.users;
      AvailableUsersStore.emitChange();
      break;

    default:
      // No operation
  }

});

module.exports = AvailableUsersStore;
