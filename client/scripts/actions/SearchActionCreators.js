var AppDispatcher    = require('../dispatchers/AppDispatcher');
var SearchConstants  = require('../constants/SearchConstants');
var ActionTypes      = SearchConstants.ActionTypes;

module.exports = {
  search: function(query) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SEARCH,
      query: query
    });
  },

  searchFinished: function(results) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.SEARCH_FINISHED,
      results: results
    });
  }
};
