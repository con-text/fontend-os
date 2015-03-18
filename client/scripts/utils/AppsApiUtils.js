// TODO: Should use HTTPS?
var baseUrl = 'http://localhost:5000';
var appServerUrl = 'http://localhost:3001';

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
  },

  deleteState: function(uuid, appId, objectId, callback) {

    $.ajax({
      contentType: 'application/json',
      type: 'DELETE',
      url: appServerUrl + '/app/' +uuid + '/' + appId + '/states/' + objectId,
      success: callback
    });

  }
};
