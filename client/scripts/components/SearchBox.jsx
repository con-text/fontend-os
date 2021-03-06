/** @jsx React.DOM */
'use strict';

var React = require('react');
var _ = require('lodash');

// Actions
var DesktopActions = require('../actions/DesktopActionCreators');
var SearchActions = require('../actions/SearchActionCreators');
var SearchResultsStore = require('../stores/SearchResultsStore');
var AppsActions = require('../actions/AppsActionCreators');
var SessionApiUtils = require('../utils/SessionApiUtils');

var SessionStore = require('../stores/SessionStore');

// Escape key code
var ESC_KEY_CODE = 27;
var UP_KEY = 38;
var DOWN_KEY = 40;

// Initialize the results store
SearchResultsStore.init();

var SearchResultItem = React.createClass({

  propTypes: {
    selected: React.PropTypes.object,
    result: React.PropTypes.object.isRequired,
    mouseEnter: React.PropTypes.func,
    mouseLeave: React.PropTypes.func,
    handleClick: React.PropTypes.func.isRequired,
  },

  getDefaultProps: function() {
    return {
      selected: null,
    };
  },

  render: function() {
    var result = this.props.result;

    var divClass = "search-item" +
      (this.props.selected === result ? ' active' : '');

    var icon = (result.value.indexOf("Go to:") > -1
             || result.value.indexOf("Search Google for:") > -1) ? 'fa fa-globe fileIcon' : 'fa fa-file-text-o fileIcon';

    return <li
      onMouseEnter={this.handleMouseEnter}
      onMouseLeave={this.handleMouseLeave}
      onClick={this.props.handleClick}
      className={divClass}><i className={icon}></i>{result.value}

        <div className="actions">
          {this.renderDeleteButton()}
          {this.renderDeleteAnimation()}
        </div>
      </li>;
  },

  renderDeleteAnimation: function() {
      if(this.props.result.isRemoving) {
        return (
          <span clsasName="remove">
            <div className="loader smallLoad"></div>
          </span>
        );
      }
      return '';
  },

  renderDeleteButton: function() {

    if(this.props.result.app.state.id && !this.props.result.isRemoving) {
      var deleteIconStyle = 'fa fa-trash-o';
      return <i className={deleteIconStyle} onClick={this.handleRemoveClick}></i>;
    }

    return '';
  },

  handleMouseEnter: function(e) {
    if(this.props.mouseEnter) {
      this.props.mouseEnter(this.props.result);
    }
  },

  handleMouseLeave: function(e) {
    if(this.props.mouseLeave) {
      this.props.mouseLeave(this.props.result);
    }
  },

  handleRemoveClick: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if(this.props.result.app) {
      AppsActions.deleteState(this.props.result.app);
    }
  }
});

var SearchBox = React.createClass({

  propTypes: {
    boxVisible: React.PropTypes.bool.isRequired,
    user: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      boxVisible: false
    };
  },

  getInitialState: function() {
    return {
      searchTerm: '',
      isSearching: SearchResultsStore.isSearching(),
      searchResults: SearchResultsStore.getResults(),
      hasResults: SearchResultsStore.hasResults(),
      selected: null,
      profile: null
    };
  },

  componentDidMount: function() {
    if(this.props.boxVisible) {
      this.focusInput();
    }

    SearchResultsStore.addChangeListener(this._onChange);

    if(this.state.searchTerm.trim() !== '') {
      SearchActions.search(this.props.user, this.state.searchTerm);
    }


    if(this.props.user) {
      SessionApiUtils.getProfile(this.props.user).done(function(user) {
        this.setState({profile: user});
      }.bind(this));
    }
  },

  componentWillUnmount: function() {
    SearchResultsStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(nextProps) {
    if(nextProps.boxVisible) {
      this.focusInput();
    }

    if(nextProps.user) {
      SessionApiUtils.getProfile(nextProps.user).done(function(user) {
        if (this.isMounted()) {
          this.setState({profile: user});
        }
      }.bind(this));
    }
  },

  focusInput: function() {
    if(this.refs.searchInput) {
      setTimeout(function() {
        this.refs.searchInput.getDOMNode().focus();
      }.bind(this), 500);
    }
  },

  renderResults: function() {


    var results = this.state.searchResults.map(function(result, i) {
      return <SearchResultItem key={i}
        result={result}
        selected={this.state.selected}
        mouseEnter={this.onMouseEnter}
        mouseLeave={this.onMouseLeave}
        handleClick={this.handleSubmit} />;
    }, this);

    return !this.state.hasResults ?
      '' :
      <div className="searchResults">
        <ul>{results}</ul>
      </div>;
  },

  onMouseEnter: function(model) {
    this.setState({selected: model});
  },

  onMouseLeave: function(model) {
    this.setState({selected: null});
  },

  renderLoading: function() {

    if(!this.state.isSearching) {
      return '';
    }

    return  <div className='loading'></div>;
  },

  renderForm: function() {

    var placeholder = 'Nimble Search';
    var currentUser = SessionStore.getCurrentUser();

    if(this.state.profile && this.props.user !== currentUser.uuid) {
      placeholder = 'Searching ' + this.state.profile.name + '\'s files';
    }

    return (
      <form className="searchBar" onSubmit={this.handleSubmit}>
        <i className="fa fa-search fa-lg largerFind"></i>
        <input ref="searchInput" type="search" value={this.state.searchTerm}
          onChange={this.handleTermChange}
          onKeyDown={this.handleKeyDown}
          placeholder={placeholder} />
      </form>
    );
  },

  render: function() {
    var divStyle = {
      display: this.props.boxVisible ? 'block' : 'none'
    };

    return (
      <div id="searchBox" style={divStyle}>
        {this.renderForm()}
        {this.renderLoading()}
        {this.renderResults()}
      </div>
    );
  },

  handleKeyDown: function(e) {
    var index;

    if(e.keyCode === ESC_KEY_CODE) {
      DesktopActions.closeSearch();
    } else if(e.keyCode === DOWN_KEY && this.state.hasResults) {

      if(this.state.selected) {

        // Get current index
        index = _.indexOf(this.state.searchResults, this.state.selected);

        // Move to next element
        if(index + 1 >= this.state.searchResults.length) {
          this.setState({selected: this.state.searchResults[0]});
        } else {
          this.setState({selected: this.state.searchResults[index + 1]});
        }

      } else {
        this.setState({selected: _.first(this.state.searchResults)});
      }

    } else if(e.keyCode === UP_KEY && this.state.hasResults) {

      if(this.state.selected) {

        // Get current index
        index = _.indexOf(this.state.searchResults, this.state.selected);

        // Move to next element
        if(index - 1 < 0) {
          this.setState({selected: _.last(this.state.searchResults)});
        } else {
          this.setState({selected: this.state.searchResults[index - 1]});
        }

      } else {
        this.setState({selected: _.last(this.state.searchResults)});
      }
    }
  },

  handleTermChange: function(e) {
    var newValue = e.target.value;
    var oldValue = this.state.searchTerm;

    this.setState({searchTerm: newValue});

    if(newValue !== oldValue) {
      SearchActions.search(this.props.user, newValue);
    }
  },

  handleSubmit: function(e) {
    e.preventDefault();

    if(this.state.selected) {

      if(this.state.selected.action)
        this.state.selected.action();
        this.setState({searchTerm: ''});
        e.target.value = '';
    }
  },

  _onChange: function() {
    this.setState({
      isSearching: SearchResultsStore.isSearching(),
      searchResults: SearchResultsStore.getResults(),
      hasResults: SearchResultsStore.hasResults()
    }, function() {
      if (this.state.hasResults) {
        this.setState({selected: _.first(this.state.searchResults)});
      }
    });
  }
});

module.exports = SearchBox;
