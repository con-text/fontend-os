var WindowConstants = require('../constants/WindowConstants');
var AppDispatcher = require('../dispatchers/AppDispatcher');

var ActionTypes = WindowConstants.ActionTypes;

module.exports = {

  createWindowFromEl: function(title, el) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CREATE_WINDOW_FROM_ELEMENT,
      title: title,
      el: el
    });
  },

  toggleWindow: function(title) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.TOGGLE_WINDOW,
      title: title
    });
  }
};
