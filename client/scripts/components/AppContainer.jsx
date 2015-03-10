var React = require('react');

// Drag and drop
var reactDnd = require('react-dnd');
var DragDropMixin = reactDnd.DragDropMixin;
var DropEffects = reactDnd.DropEffects;
var ItemTypes = require('./DragItemTypes');

// Stores
var SessionStore = require('../stores/SessionStore');

// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');
var AppsActionCreators    = require('../actions/AppsActionCreators');
var NotificationActionCreators = require('../actions/NotificationActionCreators');

var AppsApiUtils = require('../utils/AppsApiUtils');

var _ = require('lodash');


var TRANSPARENT_PIXEL_SRC = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
var emptyImg = document.createElement('img');

emptyImg.src = TRANSPARENT_PIXEL_SRC;

function getEmptyImage() {
  return emptyImg;
}

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

      register(ItemTypes.WINDOW, {
        dragSource: {
          beginDrag: function(component) {
            return {
              item: component.props,
              effectAllowed: DropEffects.MOVE,
              dragPreview: getEmptyImage()
            };
          }
        }
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

    var dropState = this.getDropState(ItemTypes.USER);
    var backgroundColor = 'white';

    var dragStateWindow = this.getDragState(ItemTypes.WINDOW);

    if(dragStateWindow.isDragging) {
      backgroundColor = 'transparent';
    }

    var divStyle = {
      display: this.props.app ? 'block' : 'none',
      left: this.props.x,
      top: this.props.y
    };

    if(dropState.isHovering) {
      divStyle.background = 'gray';

    } else if(dropState.isDragging) {
      divStyle.opacity = 0.8;
    }

    var innerDivStyle = {
      display: dropState.isDragging ? 'none' : 'block'
    };

    var dragOverlayDivStyle = {
      display: dropState.isDragging ? 'block' : 'none'
    };

    return <div className="appContainer" style={divStyle}
      {...this.dropTargetFor(ItemTypes.USER)}
      {...this.dragSourceFor(ItemTypes.WINDOW)}
      >
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
