var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    LAUNCH_APP: null,
    CLOSE_APPS: null,
    DELETE_STATE: null,
    DELETE_STATE_COMPLETED: null
  })
};
