var AppDispatcher    = require('../dispatchers/AppDispatcher');
var DesktopConstants = require('../constants/DesktopConstants');
var ActionTypes      = DesktopConstants.ActionTypes;

// Other actions
var SearchActions = require('./SearchActionCreators');

module.exports = {
  toggleSearch: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_SEARCH
    });
  },

  closeSearch: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CLOSE_SEARCH
    });

    SearchActions.resetSearch();
  }
};
