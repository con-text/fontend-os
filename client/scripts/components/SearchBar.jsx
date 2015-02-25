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
    var divClass = this.state.searchTerm.trim() === '' ? '' : 'active';

    return (
      <form id="searchBar" onSubmit={this.handleSubmit}>
        <input type="search" value={this.state.searchTerm}
          onChange={this.handleTermChange} />
        <div id="searchResults" className={divClass}>
          <h3>Searching for {this.state.searchTerm}</h3>
        </div>
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
