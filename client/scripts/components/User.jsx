/** @jsx React.DOM */
'use strict';

var React = require('react');

// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');

var SessionActionCreators = require('../actions/SessionActionCreators');

// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');


// Single list element
var User = React.createClass({

  mixins: [DragDropMixin],

  propTypes: {
    disabled: React.PropTypes.bool,
    showNames: React.PropTypes.bool,
    user: React.PropTypes.object.isRequired,
    loggedIn: React.PropTypes.bool
  },

  statics: {
    configureDragDrop: function(register) {

      register(ItemTypes.USER, {
        dragSource: {
          beginDrag: function(component) {
            return {
              item: component.props.user
            };
          }
        }
      });
    }
  },

  getDefaultProps: function() {
    return {
      disabled: false,
      showNames: true,
      loggedIn: false
    };
  },

  handleClick: function() {
    if(!this.props.disabled) {
      // Call authenticate API and invoke action
      SessionActionCreators.authenticateUser(this.props.user);
    }
  },

  render: function() {
    var pictureEl, nameEl;
    var loggedInClass = this.props.loggedIn? " logged-in" : "";
    if(this.props.showNames) {
      pictureEl =
        <div className="user-picture">
          <img className="userPic test img-circle"
            src={this.props.user.profilePicUrl} />
        </div>;

      nameEl =
        <div className="padLR profileHeight">
          <div className="userName vcenter padLR names profileHeight">{this.props.user.name}</div>
        </div>;

    } else {

      pictureEl =
          <img className="userPic test img-circle "
            src={this.props.user.profilePicUrl}
             />;

      nameEl = '';
    }

    return (
      <div className={"user" + loggedInClass} onClick={this.handleClick} title={this.props.user.name}
        {...this.dragSourceFor(ItemTypes.USER)}>
        {pictureEl}
        {nameEl}
      </div>
    );
  }
});

module.exports = User;
