var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    CREATE_SESSION: null,
    DESTROY_SESSION: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
}
