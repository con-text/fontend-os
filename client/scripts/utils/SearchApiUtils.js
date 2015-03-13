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

/**
* Find app by name and check for states
*/
function checkForAppWithStates(appName, deferred, query, params) {

  if(appName.toLowerCase().indexOf(query.toLowerCase()) !== -1 && query !== '') {

    var app = findAppByName(appName);

    // State search is async, so add promise to the deferred objects array
    deferred.push(findStates(app, params));
  }
}

/**
* Check if query contains a URL, if so, add browser as possible action
*/
function checkForWebsite(query, results) {

  // Try to match URL
  var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);
  if(urlExp.test(query)) {

    app = findAppByName("Browser");

    // Pass argument to the app
    var browserParams = {};

    browserParams.args = {
      query: query
    };

    // Don't create object for website
    browserParams.useDefault = true;

    // Push to result array
    results.push({
      value: "Go to: " + query,
      type: "Website",
      action: AppsActionCreator.open.bind(
        AppsActionCreator,
        app,
        browserParams)
    });
  }
}

/**
* Extract timestamp from MongoDB _id
*
* Source: http://stackoverflow.com/a/6453709/1260006
*
*/
function mongoIdToTimestamp(id) {
  var timestamp = id.toString().substring(0, 8);
  return new Date( parseInt( timestamp, 16 ) * 1000 );
}

/**
* Find all states of an app
*/
function findStates(app, params) {

  var results = [];

  // It's a deferred object
  var deferred = new $.Deferred();

  // Find documents
  AppsApiUtils.getStates(app.id, function(states) {

    results.push({
      value: "New " + app.name.toLowerCase() + " instance",
      type: "App",
      action: AppsActionCreator.open.bind(
        AppsActionCreator,
        app,
        params)
    });

    states.forEach(function(state) {

      var appParams = _.clone(params);
      // Assign state id
      appParams.objectId = state._id;

      // Extract timestamp
      var timestamp = mongoIdToTimestamp(state._id);

      results.push({
        value: "\tOpen " + app.name.toLowerCase() + " from " + timestamp,
        type: "App",
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          appParams)
      });
    });

    // Resolve the promise when server replies
    deferred.resolve(results);
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


    checkForWebsite(query, results);
    checkForAppWithStates("Calculator", deferred, query, params);
    checkForAppWithStates("Documents", deferred, query, params);

    // Wait for all deferred calls to finish
    $.when.apply($, deferred).done(function() {

      // Convert 'arguments' to an array, results for each deferred
      // object are passed as seperate argument to this callback
      var args = Array.prototype.slice.call(arguments);

      // Each individual result is an array too, so join them
      args.forEach(function(resultArr) {
        results = results.concat(resultArr);
      });

      successCallback(results, query);
    });
  }
};
