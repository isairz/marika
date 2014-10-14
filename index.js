'use strict';

var express = require('express');
var app = express();

var maru = require('./marumaru');

app.get('/', function (req, res) {
  res.send('hello, world!');
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
  default:
    res.sendStatus(404);
  }
});

app.listen(2000);
