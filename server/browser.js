/* Browser APIs */
var rest = require('restler');
var httpProxy = require('http-proxy');

function getPage(req, res) {

    var pageUrl = req.query.url;

    rest.get(pageUrl).on('complete', function(result) {
      if (result instanceof Error) {
        console.log('Error:', result.message);
      } else {
        res.send(result);
      }
    });
}

module.exports = {
  routeHandler: function(app) {
    app.get('/browser/page', getPage);
  }
};
