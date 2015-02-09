var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var should = chai.should;

require('blanket')({
    pattern: function (filename) {
        return !/node_modules/.test(filename);
    }
});

var appsApi = require('../../server/apps');

describe("Apps", function() {

  before(function() {
      sinon.stub(appsApi, 'getManifests')
      .returns([{
        name: 'browser'
      },{
        name: 'notes'
      }]);
  });

  describe("loader", function() {

    it("should load all apps with manifest", function() {

      var allApps = appsApi.getApps();

      expect(allApps.length).to.equal(2);
      expect(allApps[0].name).to.equal("browser");

    });
  });
});
