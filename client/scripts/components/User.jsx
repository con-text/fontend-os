/** @jsx React.DOM */
'use strict';

var React = require('react');

var SessionActionCreators = require('../actions/SessionActionCreators');

// Single list element
var User = React.createClass({

  propTypes: {
    disabled: React.PropTypes.bool,
    showNames: React.PropTypes.bool,
    user: React.PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {
      disabled: false,
      showNames: true
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

    if(this.props.showNames) {
      pictureEl =
        <div className="col-md-2">
          <img className="userPic test img-circle"
            src={this.props.user.profilePicUrl} />
        </div>;

      nameEl =
        <div className="col-md-10">
          <h5 className="userName col-md-3">{this.props.user.name}</h5>
        </div>;

    } else {

      pictureEl =
          <img className="userPic test img-circle"
            src={this.props.user.profilePicUrl} />;

      nameEl = '';
    }

    return (
      <div className="user row" onClick={this.handleClick}>
        {pictureEl}
        {nameEl}
      </div>
    );
  }
});

module.exports = User;
