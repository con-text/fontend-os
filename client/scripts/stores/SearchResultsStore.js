var AppDispatcher = require('../dispatchers/AppDispatcher');

var SearchConstants = require('../constants/SearchConstants');
var ActionTypes = SearchConstants.ActionTypes;

// Actions
var SearchActions = require('../actions/SearchActionCreators');

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var SearchResultsStore = assign({}, EventEmitter.prototype, {

  init: function() {
    this._isSearching = false;
    this._results = [];
  },

  isSearching: function() {
    return this._isSearching;
  },

  getResults: function() {
    return this._results;
  },

  hasResults: function() {
    return this._results.length > 0;
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
      SearchResultsStore._results = [];
      SearchResultsStore._isSearching = true;
      SearchResultsStore.emitChange();
      break;

    case ActionTypes.SEARCH_FINISHED:
      SearchResultsStore._isSearching = false;
      SearchResultsStore._results = action.results;
      SearchResultsStore.emitChange();
      break;

    case ActionTypes.SEARCH_RESET:
      SearchResultsStore.init();
      SearchResultsStore.emitChange();
      break;

    default:
      // No operation
      break;

  }
});

module.exports = SearchResultsStore;