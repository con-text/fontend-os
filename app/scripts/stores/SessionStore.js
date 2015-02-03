var SessionDispatcher = require('../dispatchers/SessionDispatcher');
var SessionConstants = require('../constants/SessionConstants');
var ActionTypes = SessionConstants.ActionTypes;
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _session;


function createSession(user) {
  _session = user;
}

function destroySession(user) {
  _session = undefined;
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

// Register with the dispatcher
SessionDispatcher.register(function(payload) {

  var action = payload.action;
  console.log(action)
  switch(action.type) {
    case ActionTypes.CREATE_SESSION:
      createSession(action.user);
      console.log("DISPATCHER REG", payload.action)
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
