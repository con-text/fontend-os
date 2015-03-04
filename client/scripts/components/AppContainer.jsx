var React = require('react');


// Drag and drop
var DragDropMixin = require('react-dnd').DragDropMixin;
var ItemTypes = require('./DragItemTypes');


// Actions
var SessionActionCreators = require('../actions/SessionActionCreators');
var AppsActionCreators    = require('../actions/AppsActionCreators');

var itemDropTarget = {
  acceptDrop: function(component, item) {
    console.log("DROP!", component, item);
  }
};
// App container
var AppContainer = React.createClass({
  mixins: [DragDropMixin],

  statics: {
    configureDragDrop: function(register) {
      console.log("Configure drag drop", register);
      register(ItemTypes.USER, {
        dropTarget: {
          acceptDrop: function(component, image) {
            // Do something with image! For example,
            console.log("Coos");
          }
        }
      });
    }
  },

  render: function() {
    var divStyle = {
      display: this.props.app ? 'block' : 'none'
    };
    return <div className="appContainer" style={divStyle}
      {...this.dropTargetFor(ItemTypes.USER)}>
      <div className="appToolbar">
        <div role="button" onClick={this.handleCloseClick}>Close</div>
      </div>
      <div className="appInnerContainer">
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
