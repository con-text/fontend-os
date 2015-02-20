var SessionDispatcher = require('../dispatchers/SessionDispatcher');
var SessionConstants = require('../constants/SessionConstants');
var ActionTypes = SessionConstants.ActionTypes;
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AvailableUsersStore = require('./AvailableUsersStore');

var CHANGE_EVENT = 'change';

var _session = null;

function createSession(user) {

  var availableUsers = AvailableUsersStore.getAvailable();
  var found = false;
  for(var index in availableUsers) {
    var availableUser = availableUsers[index];
    if(availableUser.id === user.id) {
      found = true;
      break;
    }
  }
  if(!_session && found) {
    _session = user;
  }
}

function destroySession(user) {
  _session = null;
}

function checkIfSessionIsValid() {
  var availableUsers = AvailableUsersStore.getAvailable();
  // Validate current session against the list of available users
  if(_session && availableUsers.indexOf(_session) === -1) {
    destroySession();
    SessionStore.emitChange();
  }
}

var SessionStore = assign({}, EventEmitter.prototype, {

  getCurrentUser: function() {
    return _session;
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

AvailableUsersStore.addChangeListener(function() {
  checkIfSessionIsValid();
});

// Register with the dispatcher
SessionDispatcher.register(function(payload) {

  var action = payload.action;
  switch(action.type) {
    case ActionTypes.CREATE_SESSION:
      createSession(action.user);
      SessionStore.emitChange();
      break;
    case ActionTypes.DESTROY_SESSION:
      destroySession();
      SessionStore.emitChange();
      break;

    default:
      // No operation
  }

});

module.exports = SessionStore;
