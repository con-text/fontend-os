var cookieParser = require('cookie-parser');
var session      = require('express-session');
var bodyParser   = require('body-parser');

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
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');

  next();
}

var config = {
  baseApiUrl: 'http://contexte.herokuapp.com',
  distDir: 'dist',
  appsDir: 'dist/apps',
  appsServerHost: 'http://localhost:3001',
  sessionConfig: {
    secret: '1d720742d6f82e179',
    store: null
  },

  configure: function(app, express, io, sessionStore) {
    // Set static folder
    app.use(express.static("./" + this.distDir));
    app.use(allowAppsOrigin);

    // Use cookie parser
    app.use(cookieParser());

    // Parse body in POST requests
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Use session
    this.sessionConfig.store = sessionStore;
    var sessionMiddleware = session(this.sessionConfig);

    // Share session with socket io
    io.use(function(socket, next){
      sessionMiddleware(socket.request, socket.request.res, next);
    });

    app.use(sessionMiddleware);
  },

  allowAppsOrigin: allowAppsOrigin
};

var cors = {
  // List of allowed origins
  allowedOrigins: [
    config.baseApiUrl,
    config.appsServerHost,
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:3001"
  ],
  default: config.baseApiUrl
};


module.exports = config;
