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
      <form id="searchBar">
        <input type="search" value={this.state.searchTerm}
          onChange={this.handleTermChange} />
      </form>
    );
  },

  handleTermChange: function(e) {
    var newValue = e.target.value.trim();
    this.setState({searchTerm: newValue});
  }

});

module.exports = SearchBar;
