var expect = require('chai').expect;
var sinon = require('sinon');

var SessionStore = require('../../client/scripts/stores/SessionStore');
var SessionAction = require('../../client/scripts/actions/SessionActionCreators');
var AvailableUsersStore = require('../../client/scripts/stores/AvailableUsersStore');
var AvailableUsersActions = require('../../client/scripts/actions/AvailableUsersActionCreators');
var SessionApiUtils = require('../../client/scripts/utils/SessionApiUtils');


describe('SessionStore', function() {

  var mockUser = {uuid: 1, name: "Foo Bar"};
  var badUser = {uuid: 2, name: "Bad guy"};
  var otherUser = {uuid:3, name: "Other user"};

  var _mockUsers = [mockUser, otherUser];

  sinon.stub(SessionApiUtils, 'destroySession', function(callback) {
    callback();
  });

  var stub = sinon.stub(AvailableUsersStore, "getAvailable", function() {
    return _mockUsers;
  });

  beforeEach(function() {
    SessionAction.destroySession();
  });

  afterEach(function() {
    _mockUsers = [mockUser, otherUser];
    AvailableUsersActions.updateUsers(_mockUsers);
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

  it("maintains the session if available users changes with current user still there", function() {

    _mockUsers = [mockUser, otherUser];
    SessionAction.createSession(mockUser);
    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser, "should be created user");

    // Now available users list changed
    _mockUsers = [badUser, mockUser, otherUser];
    AvailableUsersActions.updateUsers(_mockUsers);

    // Session should NOT be destroyed
    expect(SessionStore.getCurrentUser()).to.be.equal(mockUser, "should be not be destroyed user");

    stub.restore();
  });

  it("destorys session when action invoked", function() {
    SessionAction.createSession(mockUser);
    SessionAction.destroySession();
    expect(SessionStore.getCurrentUser()).to.be.equal(null);
  });
});
