var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;

module.exports = {

  /** Action opening a window with the app
  * specified by app id
  */
  open: function(appId, param) {

    //var AS = new StateInterface.AppState(objectId, "tester", browserObjectId);
    //AS._state.param = param;

    AppDispatcher.handleViewAction({
      type: ActionTypes.LAUNCH_APP,
      appId: appId,
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
