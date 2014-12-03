/** @jsx React.DOM */
var SearchBar = React.createClass({
  search: function () {
    var input = this.getDOMNode().getElementsByTagName('input')[0];
    this.props.search(input.value);
  },
  render: function () {
    return (
      <div className="search-bar">
        <input type="text" onKeyUp={this.search} placeholder="search" />
      </div>
    );
  }
});

var Manga = React.createClass({
  render: function () {
    var imgSrc = this.props.data.image || '';
    if (imgSrc.indexOf('marumaru.in') >= 0) {
      imgSrc = '/image-proxy?src=' + imgSrc;
    }
    var link = '/manga?title=' + this.props.data.title + '&link=' + encodeURIComponent(this.props.data.link);

    return (
      <li className="manga">
        <a href={link}>
          <img src={imgSrc} />
          <h3 className="title">{this.props.data.title}</h3>
        </a>
      </li>
    );
  }
});

var MangaList = React.createClass({
  getInitialState: function () {
    return {data: []};
  },
  componentDidMount: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function (data) {
        this.setState({data: data});
      }.bind(this)
    });
  },
  render: function () {
    var mangaNodes = this.state.data.filter(function (manga) {
      return manga.title.toLowerCase().indexOf(this.props.keyword.toLowerCase()) >= 0;
    }.bind(this))
    .map(function (manga, idx) {
      return <Manga key={idx} data={manga} />
    });

    return (
      <div className="listview">
        <ul>
          {mangaNodes}
        </ul>
      </div>
    );
  }
});

var Application = React.createClass({
  getInitialState: function () {
    return {searchKeyword: ''};
  },
  search: function (keyword) {
    this.setState({searchKeyword: keyword});
  },
  render: function () {
    return (
      <div>
        <div className="header">
          <SearchBar search={this.search} />
        </div>
        <div className="content">
          <MangaList url="/maru/list" keyword={this.state.searchKeyword} />
        </div>
      </div>
    );
  }
});


React.renderComponent(
  <Application />,
  $('#app').get(0)
);
