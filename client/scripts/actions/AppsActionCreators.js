var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;

module.exports = {

  /** Action opening a window with the app
  * specified by app id
  */
  open: function(app, param) {

    console.log("App", app);
    console.log("ID", app.id);

    AppDispatcher.handleViewAction({
      type: ActionTypes.LAUNCH_APP,
      app: app,
      params: param
    });
  },

  /**
  * Closes all apps
  */
  close: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CLOSE_APPS,
    });
  }
};
