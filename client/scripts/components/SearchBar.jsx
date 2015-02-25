/** @jsx React.DOM */
'use strict';

var React = require('react');

var SearchBar = React.createClass({

  getInitialState: function() {
    return {
      searchTerm: ''
    };
  },

  render: function() {
    return (
      <form id="searchBar" onSubmit={this.handleSubmit}>
        <input type="search" value={this.state.searchTerm}
          onChange={this.handleTermChange} />
      </form>
    );
  },

  handleTermChange: function(e) {
    var newValue = e.target.value;
    this.setState({searchTerm: newValue});
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var searchTerm = this.state.searchTerm.trim();

    window.console.log("Searching for " + searchTerm);
  }

});

module.exports = SearchBar;
