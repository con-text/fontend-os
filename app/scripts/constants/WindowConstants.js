var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    TOGGLE_WINDOW: null,
    CREATE_WINDOW_FROM_ELEMENT: null,
    DESTROY_WINDOW: null
  }),

  PayloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null
  })
}
