'use strict';
var cheerio = require('cheerio');
var request = require('request');

var config;

try {
  config = require('./config.json');
} catch (e) {
  console.log(e);
  console.warn("config isn't exist.\nRunning as default settings");
  config = require('./config.sample.json');
}

var marumaru = module.exports = {};

var req = function () {
  var jar = request.jar();
  var requestBase = request.defaults({
    jar: jar,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
    }
  });
  var requestLogin = request.defaults({
    jar: jar,
    headers: {
      'Referer': 'http://www.mangaumaru.com/archives/114053',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
      'Origin': 'http://www.mangaumaru.com'
    }
  });
  var loginTryed = false;

  var _req = function (url, callback) {
    function tryRequest(url, callback) {
      requestBase(url, function(err, res, body) {
        if (body.indexOf('document.cookie=\'sucuri_uidc=') != -1) {
          // sucuri ddos protector
          var cookieRegex = /document\.cookie\.indexOf\('(sucuri_uidc=\w+)'\)/.exec(body);
          jar.setCookie(cookieRegex[1], url);
          tryRequest(url, callback);
        } else if (body.indexOf('http://www.mangaumaru.com/wp-login.php?action=postpass') != -1) {
          // login for protected manga.
          _req.login(function (){
            tryRequest(url, callback);
          })
        } else {
          callback(err, res, body);
        }
      });
    }

    tryRequest(url, callback);
  }

  _req.login = function(callback) {
    if (loginTryed) {
      // Because of sucuri brute-force protector, retrying could cause ip ban. (30 times for 1 hour)
      var e = new Error('Login Failed!');
      callback(e);
      return;
    }

    loginTryed = true;
    requestLogin.post(
      'http://www.mangaumaru.com/wp-login.php?action=postpass',
      {form: {post_password: config.wp_password, Submit: 'Submit'}},
      callback
    );
  }

  return _req;
}();

marumaru.list = function (callback) {
  req('http://marumaru.in/c/1', function (err, res, body) {
    var $ = cheerio.load(body);
    callback([].map.call($('#widget_bbs_review01').find('li'), function (li) {
      return {
        link: 'http://marumaru.in' + $(li).find('a').attr('href'),
        image: $(li).find('img').attr('src'),
        title: $(li).find('strong').text().trim()
      };
    }));
  });
};

marumaru.manga = function (link, callback) {
  req(link, function (err, res, body) {
    var $ = cheerio.load(body);

    // manipulate
    var content = $('#vContent');
    content.children('.snsbox').remove();
    content.children().last().remove();

    callback({
      images: [].map.call(content.find('img'), function (img) { return $(img).attr('src'); }),
      episodes: [].map.call(content.find('a'), function (link) {
          return {
            title: $(link).text().trim(),
            link: $(link).attr('href')
          };
        }).filter(function (episode) { return episode.title; })
    });
  });
};

marumaru.episode = function (link, callback) {
  link = link.replace("www.umaumaru.com", "www.mangaumaru.com");

  req(link, function (err, res, body) {
    var $ = cheerio.load(body);

    callback({
      title: $('#content .entry-title').text().trim(),
      images: [].map.call($('article').find('p img'), function (img) { return $(img).attr('data-lazy-src'); })
    });
  });
};
