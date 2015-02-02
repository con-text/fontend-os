var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    CREATE_WINDOW: null,
    DESTROY_WINDOW: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
}
