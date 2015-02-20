var expect = require('chai').expect;
var sinon = require('sinon');

var SessionStore = require('../../client/scripts/stores/SessionStore');
var SessionAction = require('../../client/scripts/actions/SessionActionCreators');
var AvailableUsersStore = require('../../client/scripts/stores/AvailableUsersStore');
var AvailableUsersActions = require('../../client/scripts/actions/AvailableUsersActionCreators');

describe('SessionStore', function() {

  var mockUser = {id: 1, name: "Foo Bar"};
  var badUser = {id: 2, name: "Bad guy"};
  var otherUser = {id:3, name: "Other user"};

  var _mockUsers = [mockUser, otherUser];

  var stub = sinon.stub(AvailableUsersStore, "getAvailable", function() {
    return _mockUsers;
  });

  beforeEach(function() {
    SessionAction.destoySession();
  });

  it("is empty initally", function () {
    expect(SessionStore.getCurrentUser()).to.be.equal(null);
  });

  it("stores user when new user action invoked", function() {
    SessionAction.createSession(mockUser);
    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser);
  });

  it("ignores new session action if there is a session", function() {

    SessionAction.createSession(mockUser);
    SessionAction.createSession(badUser);

    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser);
  });

  it("only creates a session for one of the available users", function() {

    SessionAction.createSession(badUser);
    expect(SessionStore.getCurrentUser()).to.be.equal(null);

    SessionAction.createSession(mockUser);
    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser);
  });

  it("destoys session if user becomes unavailable", function() {

    SessionAction.createSession(mockUser);
    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser);

    // Now available users list changed
    _mockUsers = [otherUser];
    AvailableUsersActions.updateUsers(_mockUsers);

    // Session should be destroyed
    expect(SessionStore.getCurrentUser()).to.be.equal(null);

    stub.restore();
  });

  it("destorys session when action invoked", function() {
    SessionAction.createSession(mockUser);
    SessionAction.destoySession();
    expect(SessionStore.getCurrentUser()).to.be.equal(null);
  });
});
