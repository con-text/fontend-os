var fs = require('fs');
var path = require('path');

module.exports = {

  getApps: function() {

    var apps = [];

    this.getManifests().forEach(function(manifest) {
      apps.push({
        name: manifest.name
      });
    });
    return apps;
  },

  getManifests: function() {

    var manifests = [];

    var normalizedPath = path.join(__dirname, "../apps");

    fs.readdirSync(normalizedPath).forEach(function(file) {

      var filePath = "./../apps/" + file;
      normalizedPath = path.join(__dirname, filePath);
      // Now go through directories within apps folder
      if(fs.lstatSync(normalizedPath).isDirectory()) {

        // Get files in the app folder
        var currentFolder = normalizedPath;

        fs.readdirSync(currentFolder).forEach(function(file) {

          // Check if manifest
          var filePath = path.join(currentFolder, file);
          if(file === "manifest.json") {
            manifests.push(readManifest(filePath));
          }

        });
      }
    });

    return manifests;
  },

  routeHandler: function(app) {

    var self = this;
    app.get('/apps', function(req, res) {
      res.json(self.getApps());
    });
  }
};

// Parse manifest file
function readManifest(path) {
  var fileContent = fs.readFileSync(path, 'utf8');
  var parsedObject = JSON.parse(fileContent);
  return parsedObject;
}
