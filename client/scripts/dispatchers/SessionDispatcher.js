var SessionConstants = require('../constants/SessionConstants');
var Dispatcher = require('flux').Dispatcher;
var assign = require('object-assign');

var PayloadSources = SessionConstants.PayloadSources;

var SessionDispatcher = assign(new Dispatcher(), {

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

module.exports = SessionDispatcher;
