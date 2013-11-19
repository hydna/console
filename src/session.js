
function Session () {
  this.channels = {};
  this.aliases = {};
}


Session.prototype.channels = function () {
  var result = [];

  for (var k in this.channels) {
    result.push(this.channels[k]);
  }

  return result;
};


Session.prototype.registerAlias = function (alias, url) {
  this.aliases[alias] = url;
};


Session.prototype.channelByUrlOrAlias = function (url) {
  return this.channelForUrl(this.urlForAlias(url) || url);
};


Session.prototype.urlForAlias = function (alias) {
  return this.aliases[alias] || null;
};


Session.prototype.channelForUrl = function (url) {
  return this.channels[url] || null;
};


Session.prototype.openChannel = function (url, mode, token) {

  if (url in this.channels) {
    throw new Error('Channel "' + url + '" is already open');
  }

  if (token) {
    url += '?' + token;
  }

  this.channels[url] = new HydnaChannel(url, mode);

  return this.channels[url];
};


Session.prototype.closeChannel = function (urlOrChannel, message) {
  var channel;
  var url;

  if (typeof urlOrChannel == 'string') {
    url = urlOrChannel;
    channel = this.channels[url];
  } else {
    channel = urlOrChannel;
    for (var k in this.channels) {
      if (this.channels[k] == channel) {
        url = k;
        break;
      }
    }
  }

  if (channel) {
    try {
      channel.close(message);
    } catch (err) {
    }
  }

  delete this.channels[url];
};

