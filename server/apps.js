var fs = require('fs');
var path = require('path');


function App(props) {
  this.id = props.id;
  this.name = props.name;
  this.mainPage = props.mainPage;
}

module.exports = {

  App: App,

  getApps: function() {

    var apps = [];

    this.getManifests().forEach(function(manifest) {

      var mainPage = this.loadMainPage(manifest);
      apps.push(new App({
        id: manifest.id,
        name: manifest.name,
        mainPage: mainPage
      }));
    }, this);
    return apps;
  },

  loadMainPage: function(manifest){
    return fs.readFileSync(path.join(manifest.directory, "index.html")).toString();
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
      res.json(apps);
    });
  }
};

// Parse manifest file
function readManifest(path) {
  var fileContent = fs.readFileSync(path, 'utf8');
  var parsedObject = JSON.parse(fileContent);
  return parsedObject;
}
