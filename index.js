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

app.get('/image-proxy', function (req, res) {
  request(req.query.src)
  .on('error', function (err) {
    res.sendStatus(404);
  })
  .pipe(res)
});

app.get('/api/*', function (req, res) {
  maru.scrap(req.query.link, res.json.bind(res));
});

app.get('/download/*', function (req, res) {
  maru.episodeToZip(req.params[0], function(filename, output) {
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
});

var server = app.listen(2000, function () {
  var port = server.address().port;
  console.log('listening at %s...', port);
});
