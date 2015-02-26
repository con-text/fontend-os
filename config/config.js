// CORS handler for apps server
function allowAppsOrigin(req, res, next) {

  // Check requested origin against list of of allowed
  var requestedOrigin = req.header('host').toLowerCase();

  var origin = cors.default;

  cors.allowedOrigins.forEach(function(allowedOrigin) {
    if(allowedOrigin.indexOf(requestedOrigin) > -1) {
      origin = allowedOrigin;
    }
  });

  // Only one origin is allowed
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

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

var cors = {
  // List of allowed origins
  allowedOrigins: [
    config.baseApiUrl,
    config.appsServerHost,
    "http://localhost:3000",
    "http://localhost:5000"
  ],
  default: config.baseApiUrl
};


module.exports = config;
