// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';

module.exports = {

  getAll: function(callback) {
    $.get(baseUrl + '/apps/local')
    .done(function(data){
      callback(data);
    });
  },

  getStates: function(appId, callback) {
    $.get(baseUrl + '/apps/' +appId)
    .done(function(states){
      callback(states);
    });
  },

  addCollaborator: function(app, user, callback) {
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({user: user, stateId: app.stateId}),
      success: callback,
      type: 'POST',
      url: baseUrl + '/apps/' + app.id + '/collaborators'
    });
  }
};
