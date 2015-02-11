// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';

module.exports = {

  getAll: function(callback) {
    $.get(baseUrl + '/apps')
    .done(function(data){
      callback(data);
    });
  }
};
