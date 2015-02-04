/** @jsx React.DOM */
'use strict';

var React = require('react');

var AddressBar = require('./addressBar');
var PageViewer = require('./pageViewer');

var Browser = React.createClass({
  render: function() {
    return (
      <div id="browser">
        <AddressBar />
        <PageViewer />
      </div>
    )
  }
});

module.exports = Browser;
