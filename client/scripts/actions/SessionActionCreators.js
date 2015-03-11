var SessionConstants = require('../constants/SessionConstants');
var AppDispatcher = require('../dispatchers/AppDispatcher');

var ActionTypes = SessionConstants.ActionTypes;
var ApiUtils = require('../utils/SessionApiUtils');

var SessionActionCreators = {

  authenticateUser: function(user) {
    // Send the ID to the wearble to buzz
    ApiUtils.sendToWearble(user);

    AppDispatcher.handleViewAction({
      type: ActionTypes.START_AUTH
    });
  },

  finishAuthFailed: function() {
    AppDispatcher.handleViewAction({
      type: ActionTypes.AUTH_FAILED
    });
  },

  finishAuthSuccess: function(userId) {

    AppDispatcher.handleViewAction({
      type: ActionTypes.AUTH_SUCCESS
    });

    // Call the local server to authenticate user
    ApiUtils.authenticateUser({uuid: userId}, {
      success: function(userProfile) {
        this.createSession(userProfile);
      }.bind(this),

      error: function(err) {
        console.error(err);
      }.bind(this)
    });
  },

  createSession: function(user) {
    AppDispatcher.handleServerAction({
      type: ActionTypes.CREATE_SESSION,
      user: user
    });
  },

  destroySession: function () {
    AppDispatcher.handleServerAction({
      type: ActionTypes.DESTROY_SESSION
    });
  }
};

module.exports = SessionActionCreators;
