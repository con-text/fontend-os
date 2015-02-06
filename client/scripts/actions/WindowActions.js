var WindowConstants = require('../constants/WindowConstants');
var WindowDispatcher = require('../dispatchers/WindowDispatcher');

var ActionTypes = WindowConstants.ActionTypes;

module.exports = {

  createWindowFromEl: function(title, el) {
    WindowDispatcher.handleViewAction({
      type: ActionTypes.CREATE_WINDOW_FROM_ELEMENT,
      title: title,
      el: el
    });
  },

  toggleWindow: function(title) {
    WindowDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_WINDOW,
      title: title
    });
  }
};
