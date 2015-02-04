/** @jsx React.DOM */
'use strict';

var React = require('react');

var AddressBar = require('./addressBar');
var PageViewer = require('./pageViewer');

var Browser = React.createClass({
  render: function() {
    var webpage = {
      address: "http://bbc.co.uk/"
    };
    return (
      <div id="browser" className="browser">
        <div>
          <input />
        </div>
        <div>
          <PageViewer key='1' webpage={webpage} />
        </div>
      </div>
    );
  }
});

module.exports = Browser;
