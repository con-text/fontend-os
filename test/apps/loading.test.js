var chai = require('chai');
var sinon = require('sinon');
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var expect = chai.expect;
var should = chai.should;

require('blanket')({
    pattern: function (filename) {
        return !/node_modules/.test(filename);
    }
});

// Get code that we want to test
var appsApi = require('../../server/apps');

var testComponent = require('../../dist/apps/browser/app');

describe("Apps", function() {

  before(function() {
      // Stup get react class
      sinon.stub(appsApi, 'loadReactClass').returns(testComponent);
  });

  describe("loader", function() {

    it("should load all apps with manifest", function() {

      // Set up a mock
      var mockAppList = [{name: 'browser',},{name: 'notes'}];
      sinon.stub(appsApi, 'getManifests').returns(mockAppList);

      var allApps = appsApi.getApps();

      expect(allApps.length).to.equal(2);
      expect(allApps[0].name).to.equal("browser");

    });

    it("should render React component to a string", function() {
      var testApp = appsApi.getApps()[0];

      // Render the component
      var element = React.createElement(testComponent);

      expect(TestUtils.isElementOfType(testApp.getReactElement(), testComponent))
        .to.equal(true);
    });
  });
});
