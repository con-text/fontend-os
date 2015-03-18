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

  deleteState: function(app) {

    var uuid = SessionStore.getCurrentUser().uuid;
    AppsApiUtils.deleteState(uuid, app, function() {

      AppDispatcher.handleViewAction({
        type: ActionTypes.DELETE_STATE_COMPLETED,
        app: app
      });

      AppDispatcher.handleViewAction({
        type: ActionTypes.CLOSE_APP_WITH_STATE,
        app: app,
      });

    });

    AppDispatcher.handleViewAction({
      type: ActionTypes.DELETE_STATE,
      app: app
    });
  },

  setTitle: function(app, newTitle) {
    var uuid = SessionStore.getCurrentUser().uuid;
    AppsApiUtils.updateState(uuid, app, {title: newTitle}, function() {
      //...
    });
  }
};
