/** @jsx React.DOM */
'use strict';

var React = require('react');
var _ = require('lodash');

// Actions
var DesktopActions = require('../actions/DesktopActionCreators');
var SearchActions = require('../actions/SearchActionCreators');
var SearchResultsStore = require('../stores/SearchResultsStore');


// Escape key code
var ESC_KEY_CODE = 27;
var UP_KEY = 38;
var DOWN_KEY = 40;

// Initialize the results store
SearchResultsStore.init();

var SearchBox = React.createClass({

  propTypes: {
    boxVisible: React.PropTypes.bool.isRequired
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
    };
  },

  componentDidMount: function() {
    if(this.props.boxVisible) {
      this.focusInput();
    }

    SearchResultsStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    SearchResultsStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(nextProps) {
    if(nextProps.boxVisible) {
      this.focusInput();
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

    var results = this.state.searchResults.map(function(result) {
      var divClass = this.state.selected === result ? 'active' : '';
      return <li className={divClass}><i className="fa fa-file-text-o fileIcon"></i>{result.value}</li>;
    }, this);

    return !this.state.hasResults ?
      '' :
      <div className="searchResults">
        <ul>{results}</ul>
      </div>;
  },

  renderLoading: function() {

    if(!this.state.isSearching) {
      return '';
    }

    return  <div>...</div>;
  },

  renderForm: function() {
    return (
      <form className="searchBar" onSubmit={this.handleSubmit}>
        <i className="fa fa-search fa-lg largerFind"></i>
        <input ref="searchInput" type="search" value={this.state.searchTerm}
          onChange={this.handleTermChange}
          onKeyDown={this.handleKeyDown}
          placeholder="Context Search" />
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
    this.setState({searchTerm: newValue});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var searchTerm = this.state.searchTerm.trim();
    SearchActions.search(searchTerm);
  },

  _onChange: function() {
    this.setState({
      isSearching: SearchResultsStore.isSearching(),
      searchResults: SearchResultsStore.getResults(),
      hasResults: SearchResultsStore.hasResults()
    });
  }
});

module.exports = SearchBox;
