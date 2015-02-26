var AppDispatcher    = require('../dispatchers/AppDispatcher');
var DesktopConstants = require('../constants/DesktopConstants');
var ActionTypes = DesktopConstants.ActionTypes;

module.exports = {
  toggleSearch: function(users) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.TOGGLE_SEARCH
    });
  }
};
