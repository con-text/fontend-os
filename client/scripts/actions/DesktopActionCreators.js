var AppDispatcher    = require('../dispatchers/AppDispatcher');
var DesktopConstants = require('../constants/DesktopConstants');
var ActionTypes      = DesktopConstants.ActionTypes;

// Other actions
var SearchActions = require('./SearchActionCreators');

module.exports = {
  toggleSearch: function(uuid) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_SEARCH,
      uuid: uuid
    });
  },

  closeSearch: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CLOSE_SEARCH
    });

    SearchActions.resetSearch();
  }
};
