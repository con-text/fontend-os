var React = require('react');

var SessionActionCreators = require('../actions/SessionActionCreators');

// Single list element
var User = React.createClass({
  
  propTypes: {
    disabled: React.PropTypes.bool,
    user: React.PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {
      disabled: false
    };
  },

  handleClick: function() {
    if(!this.props.disabled) {
      // Call authenticate API and invoke action
      SessionActionCreators.authenticateUser(this.props.user);
    }
  },

  render: function() {

    return (
      <div className="user row" onClick={this.handleClick}>
        <div className="col-md-2">
          <img className="userPic test img-circle"
            src={this.props.user.profilePicUrl} />
        </div>
        <div className="col-md-10">
          <h3 className="userName col-md-3">{this.props.user.name}</h3>
        </div>
      </div>
    );
  }
});

module.exports = User;
