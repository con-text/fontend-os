var baseUrl = 'http://localhost:5000';
var _ = require('lodash');

module.exports = {

  search: function(query, options) {

    query = query || '';
    query = query.trim();

    options = options || {};
    var successCallback = options.success;
    var errorCallback   = options.error;
    var results = [];

    // Imaginary action
    var BrowserAction = {
      open: function(url) {
        console.log("Opening " + url);
      }
    };

    // Try to match URL
    var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);
    if(urlExp.test(query)) {

        results.push({
          value: "Go to: " + query,
          type: "Website",
          action: BrowserAction.open.bind(
            BrowserAction.open.prototype,
            query)
        });

      }

    setTimeout(function() {

      if(query !== '') {
        results.push({
          value: "Calculator",
          type: "App"
        },
        {
          value: "Some definition form the dictionary",
          type: "Definition"
        });
      }

      successCallback(results, query);

    }, 100);
  }
};
