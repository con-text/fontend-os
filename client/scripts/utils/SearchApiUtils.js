var baseUrl = 'http://localhost:5000';
var _ = require('lodash');

// Apps Store
var AppsStore = require('../stores/AppsStore');
var AppsActionCreator = require('../actions/AppsActionCreators');
var StateInterface = require('./StateInterface');

module.exports = {

  search: function(query, options) {

    query = query || '';
    query = query.trim();

    options = options || {};
    var successCallback = options.success;
    var errorCallback   = options.error;
    var results = [];
    var app;
    var apps = AppsStore.getApps();
    var browserObjectId;
    var id;

    // Try to match URL
    var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);
    if(urlExp.test(query)) {

      // Find browser
      for(id in apps) {
        if(apps[id].name === "Browser") {
          app = apps[id];
        }
      }

      results.push({
        value: "Go to: " + query,
        type: "Website",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          query)
      });

    }

    if("calculator".indexOf(query.toLowerCase()) !== -1 && query !== '') {

      for(id in apps) {
        if(apps[id].name === "Calculator") {
          app = apps[id];
        }
      }

      results.push({
        value: "Open calculator",
        type: "App",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          query)
      });
    }

    successCallback(results, query);
  }
};
