'use strict';

var express = require('express');
var request = require('request');
var app = express();

var maru = require('./marumaru');

app.set('view engine', 'jade')

app.use(require('serve-static')('public'));

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/manga', function (req, res) {
  res.render('manga', {title: req.query.title, link: req.query.link});
});

app.get('/image-proxy', function (req, res) {
  request(req.query.src)
  .on('error', function (err) {
    res.sendStatus(404);
  })
  .pipe(res)
});

app.get('/maru/:method', function (req, res) {
  switch(req.param('method')) {
  case 'list':
    maru.list(res.json.bind(res));
    break;
  case 'manga':
    maru.manga(req.query.link, res.json.bind(res));
    break;
  case 'episode':
    maru.episode(req.query.link, res.json.bind(res));
    break;
  case 'download':
    maru.episodeToZip(req.query.link, function(filename, output) {
      res
      .attachment(filename)
      .on('close', function () {
        return res.end();
      });

      output
      .on('error', function (err) {
        console.error('Download fail: ' + req.query.link + '\nError message: ' + err.message);
        res.end();
      })
      .pipe(res);
    });
    break;
  default:
    res.sendStatus(404);
  }
});

var server = app.listen(2000, function () {
  var port = server.address().port;
  console.log('listening at %s...', port);
});
