var AvailableUsersDispatcher = require('../dispatchers/AvailableUsersDispatcher');
var SessionDispatcher = require('../dispatchers/SessionDispatcher');

var SessionConstants = require('../constants/SessionConstants');
var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var ActionTypes = SessionConstants.ActionTypes;

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var AvailableUsersStore = require('./AvailableUsersStore');
var _ = require('lodash');
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

  // Check if there is session at all
  if(!_session) {
    return;
  }

  // Get available users
  var availableUsers = AvailableUsersStore.getAvailable();

  var foundUser = false;

  // Compare to session, cannot use === because these are hashes
  for(var key in availableUsers) {
    var user = availableUsers[key];
    if(_.isEqual(user, _session)) {
          foundUser = true;
      }
  }

  // Validate current session against the list of available users
  if(_session && !foundUser) {
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

// Register the store with the dispatcher
AvailableUsersDispatcher.register(function(payload) {

  var action = payload.action;

  switch(action.type) {

    case AvailableUsersConstants.ActionTypes.USERS_UPDATED:
      AvailableUsersDispatcher.waitFor([AvailableUsersStore.dispatchToken]);
      checkIfSessionIsValid();
      break;
    default:
      // No operation
  }
});

// Register with the dispatcher
SessionStore.dispatchToken = SessionDispatcher.register(function(payload) {

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
