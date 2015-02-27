var AppDispatcher = require('../dispatchers/AppDispatcher');

var SearchConstants = require('../constants/SearchConstants');
var ActionTypes = SearchConstants.ActionTypes;

// Actions
var SearchActions = require('../actions/SearchActionCreators');

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var _ = require('lodash');
var CHANGE_EVENT = 'change';

var SearchResultsStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this._isSearchVisible = false;
  },

  isSearchVisible: function() {
    return this._isSearchVisible;
  },

  toggleSearchVisible: function() {
    this._isSearchVisible = !this._isSearchVisible;
  },

  closeSearch: function() {
    this._isSearchVisible = false;
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
SearchResultsStore.dispatchToken = AppDispatcher.register(function(payload) {

  var action = payload.action;
  switch(action.type) {

    case ActionTypes.SEARCH:
      var query = action.query;
      
      setTimeout(function() {
        SearchActions.searchFinished(["Result 1", "Result 2"]);
      }, 100);

      break;
    case ActionTypes.SEARCH_FINISHED:
      var results = action.results;
      console.log("Results", results);
      break;
    default:
      // No operation
      break;

  }
});

module.exports = SearchResultsStore;
