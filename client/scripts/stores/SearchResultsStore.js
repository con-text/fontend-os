var AppDispatcher = require('../dispatchers/AppDispatcher');

var SearchConstants = require('../constants/SearchConstants');
var ActionTypes = SearchConstants.ActionTypes;
var AppsActionTypes = require('../constants/AppsConstants').ActionTypes;

// Actions
var SearchActions = require('../actions/SearchActionCreators');

var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var _ = require('lodash');

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
  var appId;
  var stateId;

  switch(action.type) {

    case ActionTypes.SEARCH:
      var query = action.query;
      var userId = action.userId;
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

    case AppsActionTypes.DELETE_STATE:

      var searchResult = _.findWhere(SearchResultsStore._results, {
        app: action.app
      });

      searchResult.isRemoving = true;

      SearchResultsStore.emitChange();
      break;

    case AppsActionTypes.DELETE_STATE_COMPLETED:
      appId = action.app.id;
      stateId = action.app.state.id;

      _.remove(SearchResultsStore._results, function(searchResult) {
        return searchResult.app.id === appId && searchResult.app.state.id === stateId;
      });

      SearchResultsStore.emitChange();
      break;

    default:
      // No operation
      break;

  }
});

module.exports = SearchResultsStore;
