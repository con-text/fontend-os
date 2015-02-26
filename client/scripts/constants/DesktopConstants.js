var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    TOGGLE_SEARCH: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
};
