/** @jsx React.DOM */
'use strict';

var React = require('react');

var AddressBar = React.createClass({

  getInitialState: function() {
      return {
        address: this.props.webpage.address || ''
      };
  },

  render: function() {
    return(
        <input id="address-bar" type="text" value={this.state.address}
          onChange={this._onChange} />
    );
  },

  _onChange: function(e) {
    this.setState({address: e.target.value});
  }
});

module.exports = AddressBar;
