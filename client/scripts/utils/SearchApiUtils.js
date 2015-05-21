var _ = require('lodash');

// Apps Store
var AppsStore = require('../stores/AppsStore');
var AppsActionCreator = require('../actions/AppsActionCreators');
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
function findStates(userId, app, params) {

  var results = [];

  // It's a deferred object
  var deferred = new $.Deferred();

  // Find documents
  AppsApiUtils.getStates(app.id, userId, function(states) {

    var actionName = app.name.toLowerCase();

    // Special cases:
    if(actionName === 'documents') {
      actionName = 'document';
    } else if(actionName === 'calculator') {
      actionName = 'calculator';
    }

    results.push({
      value: 'Open new ' + actionName,
      type: 'App',
      app: {
        id: app.id,
        state: {}
      },
      action: AppsActionCreator.open.bind(
        AppsActionCreator,
        app,
        params,
        userId)
    });

    states.forEach(function(state) {

      var appParams = _.clone(params);
      // Assign state id
      appParams.state = state;
      appParams.state.id = state._id;
      var timestamp = mongoIdToTimestamp(state._id);
      var stateName = '';
      if(state.title) {
        stateName = ' - ' + state.title;
      } else {
        // Extract timestamp
        stateName = ' from ' + timestamp.toDateString();
      }

      results.push({
        value: '\t\tOpen ' + actionName + stateName,
        type: 'App',
        timestamp: timestamp,
        // App parameters
        app: {
          id: app.id,
          state: appParams.state
        },
        action: AppsActionCreator.open.bind(
          AppsActionCreator,
          app,
          appParams,
          userId)
      });
    });

    // Resolve the promise when server replies
    deferred.resolve(_.sortByOrder(results, ['timestamp'], [false]));
  });

  return deferred;
}

/**
* Find app by name and check for states
*/
function checkForAppWithStates(appName, deferred, userId, query, params) {

  if(appName.toLowerCase().indexOf(query.toLowerCase()) !== -1 &&
    query !== '') {

    var app = findAppByName(appName);

    // State search is async, so add promise to the deferred objects array
    deferred.push(findStates(userId, app, params));
  }
}

/**
* Check if query contains a URL, if so, add browser as possible action
*/
function checkForWebsite(userId, query, results) {

  // Try to match URL
  var urlExp = new RegExp(/(((http|ftp|https):\/\/)|www\.)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#!]*[\w\-\@?^=%&/~\+#])?/);

  if(urlExp.test(query)) {

    var app = findAppByName('Browser');

    // Pass argument to the app
    var browserParams = {};

    browserParams.args = {
      query: query
    };

    // Don't create object for website
    browserParams.useDefault = true;

    // Push to result array
    results.push({
      value: 'Go to: ' + query,
      type: 'Website',
      app: {
        id: app.id,
        state: {}
      },
      action: AppsActionCreator.open.bind(
        AppsActionCreator,
        app,
        browserParams,
        userId)
    });
  }
}

function generateWebsiteSearchLink(userId, query)
{

  var url = "http://google.co.uk/search?q=" + query;

  var app = findAppByName('Browser');

  // Pass argument to the app
  var browserParams = {};

  browserParams.args = {
    query: query
  };

  // Don't create object for website
  browserParams.useDefault = true;

  // Return the app
  var appDictionary = {
    value: 'Search Google for: ' + query,
    type: 'Website',
    app: {
      id: app.id,
      state: {}
    },
    action: AppsActionCreator.open.bind(
      AppsActionCreator,
      app,
      browserParams,
      userId)
  };

  return appDictionary;
}

module.exports = {

  search: function(userId, query, options) {

    // Search query
    query = query || '';
    query = query.trim();

    options = options || {};
    var successCallback = options.success;
    var results = [];

    // Params for app
    var params = {};
    var deferred = [];

    checkForWebsite(userId, query, results);
    checkForAppWithStates('Calculator', deferred, userId, query, params);
    checkForAppWithStates('Documents', deferred, userId, query, params);
    checkForAppWithStates('PDF', deferred, userId, query, params);
    checkForAppWithStates('SimpleD', deferred, userId, query, params);
    checkForAppWithStates('2048', deferred, userId, query, params);

    // Wait for all deferred calls to finish
    $.when.apply($, deferred).done(function() {

      // Convert 'arguments' to an array, results for each deferred
      // object are passed as seperate argument to this callback
      var args = Array.prototype.slice.call(arguments);

      // Each individual result is an array too, so join them
      args.forEach(function(resultArr) {
        results = results.concat(resultArr)
      });

      if (results.length === 0 && query.length > 0) {
        results.push(generateWebsiteSearchLink(userId, query));
      }

      successCallback(results, query);
    });
  }
};
