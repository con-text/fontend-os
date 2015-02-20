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

var testClass = React.createClass({
  render: function() {
      return React.createElement('div');
  }
});

var testComponent = React.createElement(testClass);

describe("Apps", function() {

  before(function() {
  });

  describe("loading apps", function() {

    it("should load all apps with manifest", function() {

      // Set up a mock
      var mockAppList = [
        {id:'1', name: 'browser', absolutePath: "./"},
        {id: '2', name: 'notes', absolutePath: "./"}
      ];

      sinon.stub(appsApi, 'getManifests').returns(mockAppList);

      var allApps = appsApi.getApps();

      expect(allApps.length).to.equal(2);
      expect(allApps[0].name).to.equal("browser");

    });

    it("should render React component to a string", function() {
      var testApp = appsApi.getApps()[0];

      // Render the component
      var element = React.createElement(testComponent);
      //
      // expect(TestUtils.isElementOfType(testApp.reactElement, testComponent))
      //   .to.equal(true);
    });

    it("should read properties from the manifest", function() {
      appsApi.getApps().forEach(function(app) {
        expect(app).to.have.property("id");
        expect(app).to.have.property("name");
      });
    });
  });
});
