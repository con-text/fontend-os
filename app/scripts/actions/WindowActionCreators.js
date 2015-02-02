var WindowConstants = require('../constants/WindowConstants');
var WindowDispatcher = require('../dispatchers/WindowDispatcher');

var ActionTypes = WindowConstants.ActionTypes;

module.exports = {

  createWindow: function(title) {
    WindowDispatcher.handleViewAction({
      type: ActionTypes.CREATE_WINDOW,
      title: title
    });
  }

}
