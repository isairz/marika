'use strict';
var cheerio = require('cheerio');
var request = require('superagent');

var marumaru = module.exports = {};

var maximumRetryCount = 5;
function req(link, callback, errorCount, cookie) {
  errorCount = ~~errorCount;
  var headers = {};
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  request
  .get(link)
  .set(headers)
  .on('error', function (err) {
    if (errorCount < maximumRetryCount) {
      req(link, callback, errorCount + 1);
    } else {
      console.log(link, err);
    }
  })
  .end(callback);
}

marumaru.list = function (refresh, callback) {
  function refreshList(callback) {
    req('http://marumaru.in/c/1', function (res) {
      var $ = cheerio.load(res.text);
      marumaru.list.cachedDate = new Date();
      marumaru.list.cachedList = [].map.call($('#widget_bbs_review01').find('li'), function (li) {
        return {
          link: 'http://marumaru.in' + $(li).find('a').attr('href'),
          image: $(li).find('img').attr('src'),
          title: $(li).find('strong').text().trim()
        };
      });
      callback(marumaru.list.cachedList);
    });
  };

  if (refresh || !marumaru.list.cachedList) {
    refreshList(callback);
  } else {
    callback(marumaru.list.cachedList);
  }
};

marumaru.manga = function (link, callback) {
  req(link, function (res) {
    var $ = cheerio.load(res.text);

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
  function getEpisode(loaded) {
    var retryCount = 0;
    var linkChanged = false;
    function setCookieOrFinish(res) {
      var cookieRegex = /document\.cookie\.indexOf\('(sucuri_uidc=\w+)'\)/.exec(res.text);
      if (cookieRegex && cookieRegex[1]) {
        retryCount++;
        if (retryCount > 3) {
          if (link.indexOf("www.umaumaru.com") >= 0 && !linkChanged) {
            link = link.replace("www.umaumaru.com", "www.mangaumaru.com");
            linkChanged = true;
            retryCount = 0;
            req(link, setCookieOrFinish);
          } else if (link.indexOf("www.mangaumaru.com") >= 0 && !linkChanged) {
            link = link.replace("www.mangaumaru.com", "www.umaumaru.com");
            linkChanged = true;
            retryCount = 0;
            req(link, setCookieOrFinish);
          } else {
            loaded(res);
          }
        } else {
          req(link, setCookieOrFinish, 0, cookieRegex[1]);
        }
      } else {
        loaded(res);
      }
    }
    req(link, setCookieOrFinish);
  }

  getEpisode(function (res) {
    var $ = cheerio.load(res.text);

    callback(
      [].map.call($('article').find('p img'), function (img) { return $(img).attr('data-lazy-src'); })
    );
  });
};
