var fs = require('fs');
var path = require('path');

function loadMainPage(manifest){
  var mainFilePath = path.join(manifest.absolutePath, "index.html");
  return fs.readFileSync(mainFilePath).toString();
}

function App(manifest) {

  // Expect these to be in the manifest
  this.id = manifest.id;
  this.name = manifest.name;
  this.mainPage = loadMainPage(manifest);

  // Icon is optional
  if(manifest.icon) {
    this.icon = path.join(manifest.relativePath, manifest.icon);
  }
}

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
