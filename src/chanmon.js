




function ChannelMonitor (console, channel) {
  this.console = console;
  this.channel = null;

  this._initChannel(channel);
}


ChannelMonitor.prototype._initChannel = function (channel) {
  var console = this.console;
  var ref = channel.url;
  var self;

  function destroy () {
    channel.onmessage = null;
    channel.onsignal = null;
    channel.onclose = null;
    channel.onerror = null;
    // TODO: trigger this via event instead
    console.session.closeChannel(channel);
    self.onclose();
  }

  channel.onmessage = function (e) {
    var size = HydnaChannel.sizeOf(e.data);
    console.echo('<b>[MESSAGE]</b> on %s (%s bytes) >>>', ref, size);
    if (typeof e.data == 'string') {
      console.echoIndent(e.data);
    } else {
      console.echoIndent('<binary>');
    }
  };

  channel.onsignal = function (e) {
    console.echo('<b>[SIGNAL]</b> on %s', ref);
    console.echoIndent(e.data);
  };

  channel.onerror = function (e) {
    console.echo('<b>[ERROR]</b> on %s', ref);
    console.echoError(e.message);
    destroy();
  };

  channel.onclose = function (e) {
    console.echo('<b>[CLOSE]</b> on %s', ref);
    console.echoIndent(e.data || '<i>&lt;no goodbye message&gt;</i>');
    destroy();
  };
  
};

ChannelMonitor.prototype.onclose = function () {};