/** @jsx React.DOM */
'use strict';

var React = require('react');

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
            onChange={this.handleTermChange} />
        </form>
        <div className="searchResults" >
          <h3>Searching for {this.state.searchTerm}</h3>
        </div>
      </div>
    );
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
