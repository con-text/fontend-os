var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var AvailableUsersDispatcher = require('../dispatchers/AvailableUsersDispatcher');

var ActionTypes = AvailableUsersConstants.ActionTypes;

module.exports = {

  updateUsers: function(users) {
    AvailableUsersDispatcher.handleServerAction({
      type: ActionTypes.USERS_UPDATED,
      users: users
    });
  }

}
