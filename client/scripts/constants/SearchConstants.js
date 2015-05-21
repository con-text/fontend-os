var keyMirror = require('keymirror');

module.exports = {

  ActionTypes: keyMirror({
    SEARCH: null,
    SEARCH_FINISHED: null,
    SEARCH_RESET: null,
    FILE_SEARCH: null,
    FILE_SEARCH_FINISHED: null
  })
};
