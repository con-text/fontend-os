/** @jsx React.DOM */
'use strict';

var React = require('react');

var PageViewer = React.createClass({
  render: function() {
    return(
      <iframe ref="frame" src={this.props.webpage.address} />
    );
  }
});

module.exports = PageViewer;
