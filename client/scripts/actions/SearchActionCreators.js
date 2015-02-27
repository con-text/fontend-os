var AppDispatcher    = require('../dispatchers/AppDispatcher');
var SearchConstants  = require('../constants/SearchConstants');
var ActionTypes      = SearchConstants.ActionTypes;

// Utils
var SearchApiUtils = require('../utils/SearchApiUtils');

module.exports = {
  search: function(query) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SEARCH,
      query: query
    });

    SearchApiUtils.search(query, {
      success: function(results) {
        this.searchFinished(results);
      }.bind(this),
      error: function(err) {
        console.error(err);
      }
    });
  },

  searchFinished: function(results) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.SEARCH_FINISHED,
      results: results
    });
  },

  resetSearch: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SEARCH_RESET
    });
  }
};
