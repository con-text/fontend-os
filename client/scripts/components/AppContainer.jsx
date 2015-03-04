var React = require('react');


// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');


// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');
var AppsActionCreators    = require('../actions/AppsActionCreators');

var itemDropTarget = {
  acceptDrop: function(component, item) {
    // Do something with image! For example,
    console.log("Dropped a ", item);
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
      <div className="appToolbar">
        <div role="button" onClick={this.handleCloseClick}>
          <i className="fa fa-times-circle"></i>
        </div>
      </div>

      <div className="dropTarget" style={dragOverlayDivStyle}>
        <h1>Drop user here to share</h1>
      </div>

      <div className="appInnerContainer" style={innerDivStyle}>
        {this.props.app}
      </div>
    </div>;
  },

  handleCloseClick: function(e) {
    e.preventDefault();
    AppsActionCreators.close();
  }
});

module.exports = AppContainer;
