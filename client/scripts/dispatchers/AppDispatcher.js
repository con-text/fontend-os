var AvailableUsersConstants = require('../constants/AvailableUsersConstants');
var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

var PayloadSources = require('../constants/PayloadSources');

var AppDispatcher = assign(new Dispatcher(), {

  /**
  * @param {object} action The details of the action
  */
  handleServerAction: function(action) {

    var payload = {
      source: PayloadSources.SERVER_ACTION,
      action: action
    };

    this.dispatch(payload);

  },

  handleViewAction: function(action) {
    var payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action
    };

    this.dispatch(payload);
  }

});

module.exports = AppDispatcher;
