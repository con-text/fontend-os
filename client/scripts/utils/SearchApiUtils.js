var baseUrl = 'http://localhost:5000';
var _ = require('lodash');

// Apps Store
var AppsStore = require('../stores/AppsStore');
var AppsActionCreator = require('../actions/AppsActionCreators');

module.exports = {

  search: function(query, options) {

    query = query || '';
    query = query.trim();

    options = options || {};
    var successCallback = options.success;
    var errorCallback   = options.error;
    var results = [];

    // Try to match URL
    var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);
    if(urlExp.test(query)) {

        // Find browser
        var app;
        var apps = AppsStore.getApps();

        for(var id in apps) {
          if(apps[id].name === "Browser") {
            app = apps[id];
          }
        }

        results.push({
          value: "Go to: " + query,
          type: "Website",
          action: AppsActionCreator.open.bind(
            AppsActionCreator,
            app.id,
            {url: query})
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
