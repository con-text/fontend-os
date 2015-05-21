var AppDispatcher = require('../dispatchers/AppDispatcher');

var SearchConstants = require('../constants/SearchConstants');
var ActionTypes = SearchConstants.ActionTypes;

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var pendingRequest = null;
var CHANGE_EVENT = 'change';

var FileShareStore =  assign({}, EventEmitter.prototype, {


  getUserRequest: function() {
    return pendingRequest;
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
FileShareStore.dispatchToken = AppDispatcher.register(function(payload) {

  var action = payload.action;

  switch(action.type) {

    case ActionTypes.FILE_SEARCH:
      pendingRequest = action.user.uuid;
      FileShareStore.emitChange();
      break;

    case ActionTypes.FILE_SEARCH_FINISHED:
      pendingRequest = null;
      FileShareStore.emitChange();
      break;

    default:
      // No operation
      break;
  }
});

module.exports = FileShareStore;
