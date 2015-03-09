var fs = require('fs');
var path = require('path');
var unirest = require('unirest');
var config = require('../config/config');
var authenticated = require('./authenticated');

function loadMainPage(manifest){
  var mainFilePath = path.join(manifest.absolutePath, "index.html");
  return fs.readFileSync(mainFilePath).toString();
}

function App(manifest) {

  // Expect these to be in the manifest
  this.id = manifest.id;
  this.name = manifest.name;
  this.manifest = manifest;
  // Icon is optional
  if(manifest.icon) {
    this.icon = path.join(manifest.relativePath, manifest.icon);
  }
}

App.prototype.displayApp = function(uuid, objectId){
  return injectAPI(loadMainPage(this.manifest), this.manifest, uuid, objectId);
};

module.exports = {

  App: App,

  getApps: function() {

    var apps = [];

    this.getManifests().forEach(function(manifest) {

      apps.push(new App(manifest));

    }, this);
    return apps;
  },

  getManifests: function() {

    var manifests = [];

    var relativePath = "/apps/";
    var normalizedPath = path.join(__dirname, "../dist/"+ relativePath);

    fs.readdirSync(normalizedPath).forEach(function(file) {

      var filePath = "./../dist/apps/" + file;
      var relativeFolderPath = relativePath + file;

      normalizedPath = path.join(__dirname, filePath);
      // Now go through directories within apps folder
      if(fs.lstatSync(normalizedPath).isDirectory()) {

        // Get files in the app folder
        var currentFolder = normalizedPath;

        fs.readdirSync(currentFolder).forEach(function(file) {
          // Check if manifest
          var filePath = path.join(currentFolder, file);
          if(file === "manifest.json") {
            var manifest = readManifest(filePath);
            manifest.absolutePath = currentFolder;
            manifest.relativePath = relativeFolderPath;

            if(manifest.style) {
              manifest.style = manifest.relativePath + "/" + manifest.style;
            }

            manifests.push(manifest);
          }

        });
      }
    });

    return manifests;
  },

  routeHandler: function(app) {

    var self = this;
    app.get('/apps', function(req, res) {
      var apps = self.getApps();
      res.json(apps);
    });

    /**
    * Sends request with app id to signal new app opened
    */
    //TODO: Complete
    app.post('/apps/:id', authenticated, function(req, res) {

      var appId = req.params.id;
      var userId = req.session.user.id;
      unirest.post(config.baseApiUrl + '/users/' + userId + '/apps', {
        id: appId
      });
    });

    /**
    * Sends request with app id to signal new app opened
    */
    app.post('/apps/:id/collaborators', authenticated, function(req, res) {

      var appId = req.params.id;
      var userId = req.session.user.id;
      var userToShare = req.body.user;
      var stateId = req.body.stateId;

      unirest.post(config.baseApiUrl + '/users/' + userId + '/apps/' +
          appId + '/states/' + stateId +
        '/collaborators/')
      .header('Accept', 'application/json')
      .send({userId: userToShare.uuid})
      .end(function(response) {
        if(response.error) {
          res.status(response.code).json(response.error);
        } else {
          res.sendStatus(200);
        }
      });
    });

    /**
    * Signal that user closed the app
    */
    //TODO: Complete!
    app.delete('/apps/:id', authenticated, function(req, res) {

      var appId = req.params.id;
      var userId = req.session.user.id;
      unirest.delete(config.baseApiUrl + '/users/'+ userId +'/apps', {
        id: appId
      });

    });
  }
};

// Parse manifest file
function readManifest(path) {
  var fileContent = fs.readFileSync(path, 'utf8');
  var parsedObject = JSON.parse(fileContent);
  return parsedObject;
}


//this will be used to inject the api that apps will use into the source of the page.
//for now, it's simple, just adding it before hand. Later on we can explore putting in into the
//correct secion of the dom
function injectAPI(webSource, manifest, uuid, objectId){
  //this port needs to not be hardcoded
  var content = "<script type='text/javascript' src='http://localhost:5000/vendor/jquery/dist/jquery.min.js'></script>";
      content+= "<script type='text/javascript' src='http://localhost:5000/vendor/observe-js/src/observe.js'></script>";
      content+= "<script type='text/javascript' src='http://localhost:5000/js/DifMatchPatch.js'></script>";
      content+= "<script type='text/javascript' src='http://localhost:5000/js/OperationalTransformation.js'></script>";
      content+= "<script src='/socket.io/socket.io.js'></script>";
      content+= "<script type='text/javascript' src='http://localhost:5000/js/StateInterface.js'></script>";
      //hardcoded, obviously change this
      content+= "<script type='text/javascript'>var AS = new AppState('" + manifest.id + "', '" + uuid + "', '" + objectId +"');";
      content+= "var dmp = new diff_match_patch();</script>";

    if(manifest.style) {
      content += "<link href='"+ manifest.style + "' rel='stylesheet' />";
    }

  return content += webSource;
}
