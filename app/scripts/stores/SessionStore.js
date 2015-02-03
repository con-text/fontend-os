var SessionDispatcher = require('../dispatchers/SessionDispatcher');
var SessionConstants = require('../constants/SessionConstants');

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _session;


function createSession(user) {
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
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
  }

});

// Register with the dispatcher
SessionDispatcher.register(function(payload) {

  var action = payload.action;

  switch(action.type) {
    case SessionConstants.CREATE_WINDOW:
      createSession(action.user);
      SessionStore.emitChange();
      break;
    case SessionConstants.DESTROY_WINDOW:
      destroySession();
      SessionStore.emitChange();
      break;

    default:
      // No operation
  }

});

module.exports = SessionStore;
