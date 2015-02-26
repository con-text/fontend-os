var AppDispatcher = require('../dispatchers/AppDispatcher');

var DesktopConstants = require('../constants/DesktopConstants');
var ActionTypes = DesktopConstants.ActionTypes;

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var _ = require('lodash');
var CHANGE_EVENT = 'change';

var DesktopStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this._isSearchVisible = false;
  },

  isSearchVisible: function() {
    return this._isSearchVisible;
  },

  toggleSearchVisible: function() {
    this._isSearchVisible = !this._isSearchVisible;
    this.emitChange();
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
DesktopStore.dispatchToken = AppDispatcher.register(function(payload) {

  var action = payload.action;
  switch(action.type) {

    case ActionTypes.TOGGLE_SEARCH:
      DesktopStore.toggleSearchVisible();
      break;

    default:
      // No operation
      break;

  }
});

module.exports = DesktopStore;
