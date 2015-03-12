var baseUrl = 'http://localhost:5000';
var _ = require('lodash');

// Apps Store
var AppsStore = require('../stores/AppsStore');
var AppsActionCreator = require('../actions/AppsActionCreators');
var StateInterface = require('./StateInterface');
var AppsApiUtils = require('./AppsApiUtils');

/**
* Find app given its name
*/
function findAppByName(appName) {

  appName = appName || '';

  var apps = AppsStore.getApps();
  var app;

  // Find browser
  for(var id in apps) {
    if(apps[id].name.toLowerCase() === appName.toLowerCase()) {
      app = apps[id];
    }
  }

  return app;
}

function findStates(results, app, params) {

  var deferred = new $.Deferred();
  // Find documents
  AppsApiUtils.getStates(app.id, function(states) {
    states.forEach(function(state) {

      var appParams = _.clone(params);
      // Assign state id
      appParams.objectId = state._id;

      results.push({
        value: "\tOpen " + state._id,
        type: "App",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          appParams)
      });
    });

    deferred.resolve();
  });

  return deferred;
}

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

    // Params for app
    var params = {};
    var deferred = [];

    // Try to match URL
    var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);
    if(urlExp.test(query)) {

      app = findAppByName("Browser");

      // Pass argument to the app
      params.args = {
        query: query
      };

      results.push({
        value: "Go to: " + query,
        type: "Website",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          params)
      });

      deferred.push(findStates(results, app, params));

    }

    if("calculator".indexOf(query.toLowerCase()) !== -1 && query !== '') {

      app = findAppByName("Calculator");

      results.push({
        value: "Open calculator",
        type: "App",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          params)
      });

      deferred.push(findStates(results, app, params));
    }

    if("documents".indexOf(query.toLowerCase()) !== -1 && query !== '') {

      app = findAppByName("Documents");

      results.push({
        value: "Open document editor",
        type: "App",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          params)
      });

      deferred.push(findStates(results, app, params));
    }

    $.when(deferred).done(function() {
      successCallback(results, query);
    });
  }
};
