var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;
var AppsApiUtils = require('../utils/AppsApiUtils');
var SessionStore = require('../stores/SessionStore');

module.exports = {

  /** Action opening a window with the app
  * specified by app id
  */
  open: function(app, param) {

    AppDispatcher.handleViewAction({
      type: ActionTypes.LAUNCH_APP,
      app: app,
      params: param
    });
  },

  /**
  * Closes all apps
  */
  close: function(app) {
    AppDispatcher.handleViewAction({
      type: ActionTypes.CLOSE_APPS,
      app: app
    });
  },

  deleteState: function(appId, objectId) {

    var uuid = SessionStore.getCurrentUser().uuid;
    AppsApiUtils.deleteState(uuid, appId, objectId, function() {

      AppDispatcher.handleViewAction({
        type: ActionTypes.DELETE_STATE_COMPLETED,
        appId: appId,
        objectId: objectId
      });

    });

    AppDispatcher.handleViewAction({
      type: ActionTypes.DELETE_STATE,
      appId: appId,
      objectId: objectId
    });


  }
};
