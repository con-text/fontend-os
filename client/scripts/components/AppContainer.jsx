var React = require('react');

// Drag and drop
var reactDnd = require('react-dnd');
var DragDropMixin = reactDnd.DragDropMixin;
var DropEffects = reactDnd.DropEffects;
var ItemTypes = require('./DragItemTypes');

// Components
var AppTitleBar = require('../components/AppTitleBar');

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

    if(app.name.toLowerCase() === 'browser') {
      console.log("Sharing browser");
    } else {
      AppsApiUtils.addCollaborator(app, user, function() {
        NotificationActionCreators
          .createTextNotification("You are sharing this with " + user.name);
      });
    }
  },

  canDrop: function(component, item) {

    var app = component.props.app;
    if(app.name.toLowerCase() === 'browser') {
      return false;
    }

    // Small hack, disable sharing for the browser:
    return !_.isEqual(item, component.state.currentUser);
  }
};

// App container
var AppContainer = React.createClass({
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function(register, context) {
      register(ItemTypes.USER, {
        dropTarget: itemDropTarget
      });

      register(ItemTypes.WINDOW, {
        dragSource: {
          beginDrag: function(component) {
            component.props.dragStarted(component);
            return {
              item: component.props,
              effectAllowed: DropEffects.MOVE
            };
          },
          endDrag: function(component) {
            component.props.dragFinished(component);
          },

          canDrag: function(component) {
            return !component.state.fullscreen;
          }
        },

        dropTarget: {
          over: function(component, item) {
            component.props.dragOver(component);
          }
        },
      });
    }
  },

  getInitialState: function() {
    return {
      currentUser: SessionStore.getCurrentUser(),
      hidden: false,
      fullscreen: false,
      browserTitle: ''
    };
  },

  componentDidMount: function() {
    var appContainerNode = this.refs.container.getDOMNode();
    SessionStore.addChangeListener(this._onChange);

    // Put other windows at level 1
    $('.appContainer').css('z-index', 1);
    $(appContainerNode).css('z-index', 2);
    window.addEventListener('keydown', this._onKeyDown);

  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
    SessionStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    if(this.isMounted()) {
      this.setState({currentUser: SessionStore.getCurrentUser()});
    }

    if(this.refs.container) {

      var appContainerNode = this.refs.container.getDOMNode();
      if(appContainerNode && this.props.app.name.toLowerCase() === 'browser') {
        var iframe = appContainerNode.getElementsByTagName('iframe')[0];

        if(iframe) {
          var innerIframe = iframe.contentDocument.
            getElementsByTagName('iframe')[0];

          if(innerIframe) {
            var title = innerIframe.head.getElementsByTagName('title')[0]
              .innerText;

            this.setState({browserTitle: title});
          }
        }
      }
    }
  },

  _onKeyDown: function(e) {
    if(e.keyCode === 27) {
      this.setState({fullscreen: false});

      var domNode = this.getDOMNode();
      $(domNode).removeClass('fullscreen');
    }
  },

  render: function() {

    var dropState = this.getDropState(ItemTypes.USER);

    var dragStateWindow = this.getDragState(ItemTypes.WINDOW);

    var divStyle = _.assign(this.props.style, {
      display: (this.props.app && !dragStateWindow.isDragging) ?
        'block' : 'none',
      left: this.state.fullscreen? 0 : this.props.app.state.x,
      top: this.state.fullscreen? 0: this.props.app.state.y
    });

    if(this.state.hidden) {
      divStyle.display = 'none';
    }

    // Is user being dropped?
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

    var showTitleBar = true;

    var titleBarStyle = {
      display: showTitleBar ? 'flex' : 'none'
    };

    var className = 'appContainer';
    if(this.props.app.name.toLowerCase() === 'browser') {
      className += ' browser';
    }

    return <div ref="container" className={className} style={divStyle}
      {...this.dropTargetFor(ItemTypes.USER)}

      {...this.dragSourceFor(ItemTypes.WINDOW)}
      onClick={this.props.bringToFront}
      onKeyDown={this._onKeyDown}
      >
      <div className="titleBar" style={titleBarStyle}>
        <AppTitleBar app={this.props.app} title={this.state.browserTitle}/>
        <div className="buttons">
          <div role="button" onClick={this.handleFullScreen}>
            <i className="fa fa-arrows-alt btn"></i>
          </div>

          <div role="button" onClick={this.handleCloseClick}>
            <i className="fa fa-times-circle close-btn"></i>
          </div>
        </div>
      </div>

      <div className="dropTarget" style={dragOverlayDivStyle}
        {...this.dropTargetFor(ItemTypes.WINDOW)}>
        <h1>Drop user here to share</h1>
      </div>

      <div className="appInnerContainer" style={innerDivStyle}>
        {this.props.app && this.props.app.element}
      </div>
    </div>;
  },

  hideWindow: function() {
    this.setState({
      hidden: true
    });
  },

  showWindow: function() {
    this.setState({
      hidden: false
    });
  },

  handleCloseClick: function(e) {
    e.preventDefault();
    AppsActionCreators.close(this.props.app);
  },

  handleFullScreen: function(e) {
    e.preventDefault();
    var domNode = this.getDOMNode();
    $(domNode).toggleClass('fullscreen');
    var fullscreenState = this.state.fullscreen;
    this.setState({fullscreen: !fullscreenState});
  },

  handleTitleChange: function() {
    var newTitle = this.refs.titleInput.getDOMNode().value;
    console.log("titleChanged");
  }
});

module.exports = AppContainer;
