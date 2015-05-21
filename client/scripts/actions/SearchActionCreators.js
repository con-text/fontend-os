var AppDispatcher    = require('../dispatchers/AppDispatcher');
var SearchConstants  = require('../constants/SearchConstants');
var ActionTypes      = SearchConstants.ActionTypes;
var ApiUtils         = require('../utils/SessionApiUtils');

var RequestType = ApiUtils.RequestType;

// Utils
var SearchApiUtils = require('../utils/SearchApiUtils');

module.exports = {
  search: function(userId, query) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.SEARCH,
      query: query,
      userId: userId
    });

    SearchApiUtils.search(userId, query, {
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
  },

  askForPermission: function(user) {
    ApiUtils.sendToWearble(user, RequestType.File);

    AppDispatcher.handleViewAction({
      user: user,
      type: ActionTypes.FILE_SEARCH
    });
  },

  fileSearchFinished: function() {
    AppDispatcher.handleServerAction({
      type: ActionTypes.FILE_SEARCH_FINISHED
    });
  }
};
