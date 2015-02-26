var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    START_AUTH: null,
    AUTH_SUCCESS: null,
    AUTH_FAILED: null,
    CREATE_SESSION: null,
    DESTROY_SESSION: null
  })
};
