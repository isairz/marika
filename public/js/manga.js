/** @jsx React.DOM */
var EpisodeSelect = React.createClass({
  componentDidMount: function () {
    this.loadEpisode(this.props.episodes.slice().reverse()[0].link);
  },
  loadEpisode: function (link) {
    $(window).scrollTop(0);
    if (typeof link !== 'string') {
      link = $(this.getDOMNode()).find('option:selected').val();
    }
    this.props.loadEpisode(link);
  },
  render: function () {
    var options = this.props.episodes.slice().reverse().map(function (episode) {
      return (
        <option value={episode.link}>{episode.title}</option>
      );
    });
    return (
      <select onChange={this.loadEpisode}>
        {options}
      </select>
    );
  }
});

var NavigationBar = React.createClass({
  render: function () {
    var content = !this.props.data ? <div /> : (
      <div className="wrapper">
        <div className="title">{this.props.title}</div>
        <div className="episodes">
          <EpisodeSelect episodes={this.props.data.episodes} loadEpisode={this.props.loadEpisode} />
        </div>
      </div>
    );
    return (
      <div className="navigation-bar">
        {content}
      </div>
    );
  }
});

var MangaImages = React.createClass({
  imageProxy: function (e, id) {
    var img = $("img[data-reactid='" + id + "']", this.getDOMNode());
    var src = img.attr('data-src');
    img.attr('src', '/image-proxy?src=' + encodeURIComponent(src));
  },
  render: function () {
    var images = this.props.images.map(function (image) {
      return <img src={image} data-src={image} onError={this.imageProxy} />
    }.bind(this));
    if (images.length === 0 && this.props.link) {
      images = (
        <div className="no-image">
          <h1>No image... Maybe protected. Please visit the link directly.</h1>
          <a href={this.props.link}>{this.props.link}</a>
        </div>
      );
    }
    return (
      <div className="images">
        {images}
      </div>
    );
  }
});

var Application = React.createClass({
  getInitialState: function () {
    return {data: null, images: [], episodeLink: ''}
  },
  componentDidMount: function () {
    var url = '/maru/manga?link=' + this.props.link;
    $.ajax({
      url: url,
      dataType: 'json',
      success: function (data) {
        this.setState({data: data});
      }.bind(this)
    });
  },
  loadEpisode: function (link) {
    var url = '/maru/episode?link=' + link;
    $.ajax({
      url: url,
      dataType: 'json',
      success: function (data) {
        this.setState({images: data, episodeLink: link});
      }.bind(this)
    });
  },
  render: function () {
    return (
      <div>
        <NavigationBar title={this.props.title} data={this.state.data} loadEpisode={this.loadEpisode} />
        <MangaImages images={this.state.images} link={this.state.episodeLink} />
      </div>
    );
  }
});

React.renderComponent(
  <Application title={mangaTitle} link={mangaLink}/>,
  $('#app').get(0)
);
