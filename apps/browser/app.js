/** @jsx React.DOM */
'use strict';

var React = require('react');

var Browser = React.createClass({
  getInitialState: function() {
    return {
      text: ''
    };
  },
  render: function() {
    return (
      <div className="browser">
        <input value={this.state.text} onChange={this.handleChange} />
        <p>You typed: {this.state.text}</p>
      </div>
    );
  },

  handleChange: function(e) {
    this.setState({
      text: e.target.value()
    });
  }

});


module.exports = Browser;
