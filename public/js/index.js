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

var MangaNode = React.createClass({
  load: function () {
    var url = this.getDOMNode().children[0].href;
    this.props.load(url);
    return false;
  },
  render: function () {
    var imgSrc = this.props.data.thumbnail || '';
    if (imgSrc.indexOf('marumaru.in') >= 0) {
      imgSrc = '/image-proxy?src=' + imgSrc;
    }
    var link = this.props.data.link;

    return (
      <li className="manga">
        <a href={link} onClick={this.load}>
          <img src={imgSrc} />
          <h3 className="title">{this.props.data.title}</h3>
        </a>
      </li>
    );
  }
});

var MangaList = React.createClass({
  render: function () {
    var mangaNodes = this.props.data.filter(function (manga) {
      return manga.title.toLowerCase().indexOf(this.props.keyword.toLowerCase()) >= 0;
    }.bind(this))
    .map(function (manga, idx) {
      return <MangaNode key={idx} data={manga} load={this.props.load}/>
    }.bind(this));

    return (
      <div className="listview">
        <ul>
          {mangaNodes}
        </ul>
      </div>
    );
  }
});

var MangaPage = React.createClass({
  imageProxy: function (e, id) {
    var img = this.getDOMNode();
    console.log(img.attribs);
    var src = img.getAttribute('data-src');
    img.src = '/image-proxy?src=' + encodeURIComponent(src);
  },
  render: function () {
    return <img src={this.props.src} data-src={this.props.src} onError={this.props.src && this.imageProxy} style={{right: this.props.page*100 + '%'}} />;
  }
})

var MangaViewer = React.createClass({
  getInitialState: function () {
    return {page: 0};
  },
  prevPage: function () {
    if (this.state.page <= 0) {
      return;
    }
    this.setState({page: this.state.page-1});
  },
  nextPage: function () {
    if (this.state.page >= this.props.data.images.length-1) {
      return;
    }
    this.setState({page: this.state.page+1});
  },
  render: function () {
    var images = this.props.data.images;
    if (images.length === 0 && this.props.link) {
      return
        <div className="no-image">
          <h1>No image... Maybe protected. Please visit the link directly.</h1>
          <a href={this.props.link}>{this.props.link}</a>
        </div>
    }
    return (
      <div className="mangaview">
        <div className="slider" style={{transform: 'translate3d('+this.state.page*100+'%' + ', 0, 0)'}} >
          <MangaPage page={this.state.page} src={images[this.state.page]} />
          <MangaPage page={this.state.page+1} src={images[this.state.page+1]} />
          <MangaPage page={this.state.page-1} src={images[this.state.page-1]} />
          <MangaPage page={this.state.page+2} src={images[this.state.page+2]} />
        </div>
        <div className="prev" onClick={this.prevPage} />
        <div className="next" onClick={this.nextPage} />
      </div>
    );
  }
})

var Application = React.createClass({
  getInitialState: function () {
    // TODO: Use History API.
    return {searchKeyword: '', data: []};
  },
  search: function (keyword) {
    this.setState({searchKeyword: keyword});
  },
  initUrl: function () {
    return location.search.indexOf('?link=http') === 0
      ? decodeURIComponent(location.search.substr(6)) : 'http://marumaru.in/c/1';
  },
  load: function (url) {
    url = encodeURIComponent(url || this.initUrl());
    if (history.state) {
      history.pushState(null, '', location.origin + '/?link=' + url);
    }
    $.ajax({
      url: '/api/?link=' + url,
      dataType: 'json',
      success: function (data) {
        this.setState({searchKeyword:'', data: data});
        history.replaceState(this.state, data.title, location.origin + '/?link=' + url);
      }.bind(this)
    });
  },
  onPopState: function (e) {
    if (e.state) {
      this.setState(e.state);
    } else {
      load();
    }
  },
  componentWillMount: function () {
  },
  componentDidMount: function () {
    this.load();
    window.addEventListener('popstate', this.onPopState);
  },
  componentWillUnmount: function () {
    window.removeEventListener('popstate', this.onPopState);
  },
  render: function () {
    scrollTo(0, 0);
    if (this.state.data.type === 'list') {
      var content = <MangaList keyword={this.state.searchKeyword} load={this.load} data={this.state.data.data}/>
    } else if (this.state.data.type === 'manga') {
      var content = <MangaViewer data={this.state.data} />
    }
    return (
      <div>
        <div className="header">
          <SearchBar search={this.search} />
        </div>
        <div className="content">
          {content}
        </div>
      </div>
    );
  }
});


React.render(<Application className="app" />, document.body);
