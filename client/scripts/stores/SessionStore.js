var AppDispatcher = require('../dispatchers/AppDispatcher');

// Constants
var SessionConstants = require('../constants/SessionConstants');
var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var ActionTypes = SessionConstants.ActionTypes;

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

// Stores
var AvailableUsersStore = require('./AvailableUsersStore');

// Actions
var AppsActions = require('../actions/AppsActionCreators');

// Libraries
var _ = require('lodash');
var CHANGE_EVENT = 'change';

var _session = null;
var _isLoggingIn = false;
var _whoIsLoggingIn = null;

// API Utils
var SessionApiUtils = require('../utils/SessionApiUtils');

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
  // Tell the server that session is gone
  SessionApiUtils.destroySession(function() {
    _session = null;
    SessionStore.emitChange();
  });
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
    if(_.isEqual(user.id, _session.id)) {
          foundUser = true;
      }
  }

  // Validate current session against the list of available users
  if(_session && !foundUser) {
    destroySession();
  }
}

var SessionStore = assign({}, EventEmitter.prototype, {

  getCurrentUser: function() {
    return _session;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  isLoggingIn: function() {
    return _isLoggingIn;
  },

  whoLoggingIn: function() {
    return _whoIsLoggingIn;
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
SessionStore.dispatchToken = AppDispatcher.register(function(payload) {

  var action = payload.action;
  switch(action.type) {

    case ActionTypes.START_AUTH:
      _isLoggingIn = true;
      _whoIsLoggingIn = action.user;
      SessionStore.emitChange();
      break;

    case ActionTypes.AUTH_SUCCESS:
      _isLoggingIn = false;
      _whoIsLoggingIn = null;
      SessionStore.emitChange();
      break;

    case ActionTypes.AUTH_FAILED:
      _isLoggingIn = false;
      _whoIsLoggingIn = null;
      SessionStore.emitChange();
      break;

    case ActionTypes.CREATE_SESSION:
      createSession(action.user);
      SessionStore.emitChange();
      break;

    case ActionTypes.DESTROY_SESSION:
      destroySession();
      break;

    case AvailableUsersConstants.ActionTypes.USERS_UPDATED:
      // Wait for Available user store to finish handling updates
      AppDispatcher.waitFor([AvailableUsersStore.dispatchToken]);
      checkIfSessionIsValid();
      break;

    default:
      // No operation
  }
});

module.exports = SessionStore;
