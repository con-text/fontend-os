/** @jsx React.DOM */
'use strict';

var React = require('react');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');

// Components
var Sidebar   = require('./Sidebar');

var Desktop = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <Sidebar />
        <div className="desktop col-md-11"></div>
      </div>
    );
  }
});

module.exports = Desktop;
