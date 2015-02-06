var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    USERS_UPDATED: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
