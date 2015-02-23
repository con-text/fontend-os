var SessionConstants = require('../constants/SessionConstants');
var SessionDispatcher = require('../dispatchers/SessionDispatcher');

var ActionTypes = SessionConstants.ActionTypes;
var ApiUtils = require('../utils/SessionApiUtils');

var SessionActionCreators = {

  authenticateUser: function(user) {


    // Send the ID to the wearble to buzz
    ApiUtils.sendToWearble(user);

    // Call the local server to authenticate user
    ApiUtils.authenticateUser(user, {
      success: function(userProfile) {
        this.createSession(userProfile);
      }.bind(this),

      error: function(err) {
        console.error(err);
      }.bind(this)
    });
  },

  createSession: function(user) {
    SessionDispatcher.handleServerAction({
      type: ActionTypes.CREATE_SESSION,
      user: user
    });
  },

  destroySession: function () {
    SessionDispatcher.handleServerAction({
      type: ActionTypes.DESTROY_SESSION
    });
  }
};

module.exports = SessionActionCreators;
