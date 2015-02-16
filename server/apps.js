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

      // var reactClass = this.loadReactClass(manifest);
      var mainPage = injectAPI(this.loadMainPage(manifest), manifest);
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


//this will be used to inject the api that apps will use into the source of the page.
//for now, it's simple, just adding it before hand. Later on we can explore putting in into the
//correct secion of the dom
function injectAPI(webSource, manifest){
  //this port needs to not be hardcoded
  var content = "<script type='text/javascript' src='http://localhost:5000/js/StateInterface.js'></script>";
      content+= "<script type='text/javascript' src='http://localhost:5000/vendor/jquery/dist/jquery.min.js'></script>";
      content+= "<script type='text/javascript'>var AS = new AppState('" + manifest.id + "'); AS.value('something', 'cool2');";
      content+= "</script>";
  return content += webSource;
}
