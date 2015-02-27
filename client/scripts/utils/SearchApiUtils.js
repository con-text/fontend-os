var baseUrl = 'http://localhost:5000';

module.exports = {

  search: function(query, options) {
    options = options || {};
    var successCallback = options.success;
    var errorCallback   = options.error;

    setTimeout(function() {
      var results = [{
        value: "Browser",
        type: "App"
      },
      {
        value: "Calculator",
        type: "App"
      },
      {
        value: "Some definition form the dictionary",
        type: "Definition"
      }];

      successCallback(results, query);

    }, 2500);
  }
};
