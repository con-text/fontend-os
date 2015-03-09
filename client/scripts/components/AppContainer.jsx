var React = require('react');

// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');

// Stores
var SessionStore = require('../stores/SessionStore');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');
var AppsActionCreators    = require('../actions/AppsActionCreators');
var NotificationActionCreators = require('../actions/NotificationActionCreators');

var AppsApiUtils = require('../utils/AppsApiUtils');

var _ = require('lodash');

var itemDropTarget = {
  acceptDrop: function(component, item) {
    var app = component.props.app;
    var user = item;

    AppsApiUtils.addCollaborator(app, user, function() {
      NotificationActionCreators
        .createTextNotification("You a sharing this with " + user.name);
    });
  },

  canDrop: function(component, item) {
    return !_.isEqual(item, component.state.currentUser);
  }
};

// App container
var AppContainer = React.createClass({
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function(register) {

      register(ItemTypes.USER, {
        dropTarget: itemDropTarget
      });
    }
  },

  getInitialState: function() {
    return {
      currentUser: SessionStore.getCurrentUser()
    };
  },

  componentDidMount: function() {
    SessionStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    SessionStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState({currentUser: SessionStore.getCurrentUser()});
  },

  render: function() {

    var dragState = this.getDropState(ItemTypes.USER);
    var backgroundColor = 'white';

    var divStyle = {
      display: this.props.app ? 'block' : 'none'
    };

    if(dragState.isHovering) {
      divStyle.background = 'gray';

    } else if(dragState.isDragging) {
      divStyle.opacity = 0.8;
    }

    var innerDivStyle = {
      display: dragState.isDragging ? 'none' : 'block'
    };

    var dragOverlayDivStyle = {
      display: dragState.isDragging ? 'block' : 'none'
    };

    return <div className="appContainer" style={divStyle}
      {...this.dropTargetFor(ItemTypes.USER)}>
      <div className="titleBar">
        <div className="title">
          {this.props.app && this.props.app.name}
        </div>
        <div className="buttons">
          <div role="button" onClick={this.handleCloseClick}>
            <i className="fa fa-times-circle close-btn"></i>
          </div>
        </div>
      </div>

      <div className="dropTarget" style={dragOverlayDivStyle}>
        <h1>Drop user here to share</h1>
      </div>

      <div className="appInnerContainer" style={innerDivStyle}>
        {this.props.app && this.props.app.element}
      </div>
    </div>;
  },

  handleCloseClick: function(e) {
    e.preventDefault();
    AppsActionCreators.close();
  }
});

module.exports = AppContainer;
