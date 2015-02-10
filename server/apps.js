var fs = require('fs');
var path = require('path');
var React = require('react');

function App(props) {
  this.name = props.name;
  this.el = React.createElement(props.reactClass);
}

App.prototype.getName = function() {
  return this.name;
};

App.prototype.getReactElement = function() {
  return this.el;
};

App.prototype.renderReact = function() {
  return React.renderToString(this.getReactElement());
};

module.exports = {

  App: App,

  getApps: function() {

    var apps = [];

    this.getManifests().forEach(function(manifest) {
      apps.push(new App({
        name: manifest.name,
        reactClass: this.loadReactClass(manifest),
      }));
    }, this);
    return apps;
  },

  loadReactClass: function() {
    return require(path.join(manifest.directory, manifest.mainClass));
  },

  getManifests: function() {

    var manifests = [];

    var normalizedPath = path.join(__dirname, "../dist/apps");

    fs.readdirSync(normalizedPath).forEach(function(file) {

      var filePath = "./../dist/apps/" + file;
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
            manifest.directory = currentFolder;
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
      var appsJson = [];
      apps.forEach(function(app) {
        appsJson.push({
          name: app.getName(),
          reactElement: app.renderReact()
        });
      });

      res.json(appsJson);
    });
  }
};

// Parse manifest file
function readManifest(path) {
  var fileContent = fs.readFileSync(path, 'utf8');
  var parsedObject = JSON.parse(fileContent);
  return parsedObject;
}
