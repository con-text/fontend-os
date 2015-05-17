/** @jsx React.DOM */
'use strict';

var React = require('react');

// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');

var SessionActionCreators = require('../actions/SessionActionCreators');
var SearchActionCreators = require('../actions/SearchActionCreators');

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
    loggedIn: React.PropTypes.bool,
    sessionActive: React.PropTypes.bool.isRequired
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
    if(!this.props.disabled && !this.props.sessionActive) {
      // Call authenticate API and invoke action
      SessionActionCreators.authenticateUser(this.props.user);
    }
  },

  requestShare: function() {
    if(!this.props.disabled &&
      !this.props.loggedIn && this.props.sessionActive) {

      // Ask permission
      SearchActionCreators.askForPermission(this.props.user);
    }
  },

  render: function() {
    var pictureEl, nameEl;
    var loggedInClass = this.props.loggedIn? ' logged-in' : '';
    var title = '';

    if(this.props.showNames) {
      pictureEl =
        <div className='user-picture'>
          <img className='userPic test img-circle'
            src={this.props.user.profilePicUrl} />
        </div>;

      nameEl =
        <div className='padLR profileHeight'>
          <div className='userName vcenter padLR names profileHeight'>
            {this.props.user.name}
          </div>
        </div>;

      title = '';

    } else {

      pictureEl =
          <img className='userPic test img-circle '
            src={this.props.user.profilePicUrl}
             />;

      nameEl = '';

      title = this.props.user.name;
    }

    var styling = '';
    var loader = '';

    if (this.props.disabled) {
      styling = 'disabled';
    }

    if(this.props.isLoggingIn) {
      loader = <div className="loader"></div>;
      styling = 'clicked';
    }

    return (
      <div className={"user" + loggedInClass + " " + styling }
        onClick={this.handleClick}
        title={title}
        onDoubleClick={this.requestShare}
        {...this.dragSourceFor(ItemTypes.USER)}>
        {pictureEl}
        {nameEl}
        {loader}
      </div>
    );
  }
});

module.exports = User;
