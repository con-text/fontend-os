var React = require('react');

var PropTypes = React.PropTypes;

var AppsActions = require('../actions/AppsActionCreators');

var AppTitleBar = React.createClass({

  propTypes: {
    app: PropTypes.object.isRequired
  },

  getInitialState: function() {
    var title = '';

    if(this.props.app.state) {
      title = this.props.app.state.title || title;
    }

    return {
      isEditing: false,
      title: title
    };
  },

  render: function () {
    return (
      <div className="title">
        {this.props.app.name}
        {this.renderDocumenTitle()}
      </div>
    );
  },

  enterEdit: function(e) {
    this.setState({isEditing: true});
  },

  renderDocumenTitle: function() {

    if(this.state.isEditing) {
      return this.renderDocumentTitleEdit();
    }

    var title = 'untitled';

    if(this.state.title && this.state.title.trim() !== '') {
      title = this.state.title;
    }

    return <span className="documentTitle" onClick={this.enterEdit}> - {title}</span>;
  },

  renderDocumentTitleEdit: function() {
    return <input onBlur={this.commitChange} onChange={this.handleTitleChange} value={this.state.title} />;
  },

  handleTitleChange: function(e) {
    var input = e.target.value;
    this.setState({title: input});

  },

  commitChange: function() {
    var newTitle = this.state.title.trim();

    if(newTitle !== '' && newTitle !== this.props.app.state.title) {
      AppsActions.setTitle(this.props.app, newTitle);
    }

    this.setState({isEditing: false});
  }

});

module.exports = AppTitleBar;
