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
    var backgroundStyle = {backgroundImage: 'url(' + imgSrc + ')'};
    var link = '/manga?title=' + this.props.data.title + '&link=' + encodeURIComponent(this.props.data.link);

    return (
      <a className="manga" href={link}>
        <div className="image" style={backgroundStyle} />
        <div className="info">
          <div className="title">{this.props.data.title}</div>
        </div>
      </a>
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
    }.bind(this)).map(function (manga) {
      return <Manga data={manga} />
    });

    return (
      <div className="manga-list">
        {mangaNodes}
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
        <SearchBar search={this.search} />
        <MangaList url="/maru/list" keyword={this.state.searchKeyword} />
      </div>
    );
  }
});


React.renderComponent(
  <Application />,
  $('#app').get(0)
);
