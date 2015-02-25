var React = require('react');

// Components
var UsersList = require('./UsersList');
var SearchBar = require('./SearchBar');

// Stores
var AvailableUsersStore = require('../stores/AvailableUsersStore');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');

var LogOutMenu = React.createClass({
  render: function() {
    return <button className="btn-logout btn btn-primary btn-xs"
      onClick={this.handleClick}>Log out</button>;
  },

  handleClick: function(e) {
    e.preventDefault();
    SessionActionCreators.destroySession();
  }

});

var Sidebar = React.createClass({

  getStateFromStores: function() {
    return {
      available: AvailableUsersStore.getAvailable()
    };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  componentDidMount: function() {
    AvailableUsersStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    AvailableUsersStore.removeChangeListener(this._onChange);
  },

  render: function() {
    return (

      <div id="sidebar" className='sidebar sidebar-small row'>
        <SearchBar />
        <UsersList users={this.state.available} showNames={false} />

        <LogOutMenu />
      </div>
    );
  },

  _onChange: function() {
    this.setState(this.getStateFromStores());
  }
});

module.exports = Sidebar;
