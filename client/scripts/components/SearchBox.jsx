/** @jsx React.DOM */
'use strict';

var React = require('react');

// Actions
var DesktopActions = require('../actions/DesktopActionCreators');

// Escape key code
var ESC_KEY_CODE = 27;

var SearchBox = React.createClass({

  propTypes: {
    boxVisible: React.PropTypes.bool.isRequired
  },

  getDefaultProps: function() {
    return {
      boxVisible: false
    };
  },

  getInitialState: function() {
    return {
      searchTerm: ''
    };
  },

  render: function() {
    var divStyle = {
      display: this.props.boxVisible ? 'block' : 'none'
    };

    return (
      <div id="searchBox" style={divStyle}>
        <form className="searchBar" onSubmit={this.handleSubmit}>
          <input type="search" value={this.state.searchTerm}
            onChange={this.handleTermChange}
            onKeyDown={this.handleKeyDown} />
        </form>
        <div className="searchResults" >
          <h3>Searching for {this.state.searchTerm}</h3>
        </div>
      </div>
    );
  },

  handleKeyDown: function(e) {
    if(e.keyCode === ESC_KEY_CODE) {
      DesktopActions.closeSearch();
    }
  },

  handleTermChange: function(e) {
    var newValue = e.target.value;
    this.setState({searchTerm: newValue});
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var searchTerm = this.state.searchTerm.trim();
  }
});

module.exports = SearchBox;
