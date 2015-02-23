// CORS handler for apps server
function allowAppsOrigin(req, res, next) {

  res.header('Access-Control-Allow-Origin', config.appsServerHost);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

var config = {
  baseApiUrl: 'http://contexte.herokuapp.com',
  distDir: 'dist',
  appsDir: 'dist/apps',
  appsServerHost: 'http://localhost:3001',

  configure: function(app, express) {
    // Set static folder
    app.use(express.static("./" + this.distDir));
    app.use(allowAppsOrigin);
  }
};




module.exports = config;
