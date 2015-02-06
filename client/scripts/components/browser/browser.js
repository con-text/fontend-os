/** @jsx React.DOM */
'use strict';

var React = require('react');

var AddressBar = require('./addressBar');
var PageViewer = require('./pageViewer');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      text: ""
    };
  },
  render: function() {
    return (
      <div className="widget">
          <h2>Browser</h2>
          <input className="widget" value={this.state.text} onChange={this.handleChange} />
          <p>{this.state.text}</p>
      </div>
    );
  },

  handleChange: function(e) {
    this.setState({text: e.target.value });
  }
});
