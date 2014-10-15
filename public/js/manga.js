/** @jsx React.DOM */
var EpisodeSelect = React.createClass({
  componentDidMount: function () {
    this.loadEpisode(this.props.episodes.slice().reverse()[0].link);
  },
  loadEpisode: function (link) {
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
  render: function () {
    var images = this.props.images.map(function (image) {
      return <img src={image} />
    });
    return (
      <div className="images">
        {images}
      </div>
    );
  }
});

var Application = React.createClass({
  getInitialState: function () {
    return {data: null, images: []}
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
        this.setState({images: data});
      }.bind(this)
    });
  },
  render: function () {
    return (
      <div>
        <NavigationBar title={this.props.title} data={this.state.data} loadEpisode={this.loadEpisode} />
        <MangaImages images={this.state.images} />
      </div>
    );
  }
});

React.renderComponent(
  <Application title={mangaTitle} link={mangaLink}/>,
  $('#app').get(0)
);
