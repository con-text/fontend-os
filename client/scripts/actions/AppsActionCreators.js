var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppsConstants = require('../constants/AppsConstants');
var ActionTypes = AppsConstants.ActionTypes;
var AppsApiUtils = require('../utils/AppsApiUtils');
var SessionStore = require('../stores/SessionStore');

module.exports = {

  /** Action opening a window with the app
  * specified by app id
  */
  open: function(app, param, userId) {

    var uuid = userId || SessionStore.getCurrentUser().uuid;

    AppDispatcher.handleViewAction({
      type: ActionTypes.LAUNCH_APP,
      app: app,
      params: param,
      userId: uuid
    });

    AppsApiUtils.updateState(uuid, app, {isOpened: true}, function() {
      //...
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

    var uuid = SessionStore.getCurrentUser().uuid;
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
  },

  setPosition: function(app, x, y) {
    var position = {
      x: x,
      y: y
    };

    AppDispatcher.handleViewAction({
      type: ActionTypes.SET_POSITION,
      app: app,
      position: position
    });

    var uuid = SessionStore.getCurrentUser().uuid;
    AppsApiUtils.updateState(uuid, app, position, function() {
      //...
    });
  }
};
