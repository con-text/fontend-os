/** @jsx React.DOM */
'use strict';

var React = require('react');

var WindowActions = require('../../actions/WindowActions');

// Get window manager handle
var wm = window.wm;

// Window that contains any content
var Window = React.createClass({

  // Properties a window should have
  propTypes: {
    name: React.PropTypes.string
  },

  componentDidMount: function() {
    //var el = this.refs.window.getDOMNode();
    //WindowActions.createWindowFromEl(this.props.title, el);
  },

  render: function() {
    return (
      <section ref="window" className={"window-"+this.props.title}>
        {this.props.children}
      </section>
    );
  }
});

module.exports = Window;
