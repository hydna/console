
'use strict';

registerCommand('open', OpenCommand);


function OpenCommand (alias, console) {
  Command.call(this, alias, console);
}


OpenCommand.help = function (console, alias) {
  console.echo('usage: %s url [MODE] [TOKEN] [as ALIAS]', alias);
  console.echo('Open a channel for communication.');
  console.echo('');
  console.echo('Available options are:');
  console.echoTable([
    ['url',     'The <code>url</code> where the channel is located'],
    ['[MODE]',  'The <code>MODE</code> to open channel in. Must be one of the ' +
                'following modes: <b>READ</b>, <b>WRITE</b>, <b>EMIT</b>, '+ 
                '<b>READWRITE</b>, <b>READEMIT</b>, <b>WRITEEMIT</b> ' +
                'or <b>READWRITEEMIT(*)</b>. Default mode is <b>*</b>'],
    ['[ALIAS]', 'An optional <code>ALIAS</code> for channel which stores the ' +
                'url in the global channel alias table. The table is used ' + 
                'by other commands to refeer to the url']
  ]);
};


OpenCommand.description = function () {
  return 'Open a channel for communication';
};


OpenCommand.prototype = new Command();


OpenCommand.prototype.run = function (args) {
  var self = this;
  var console = this.console;
  var session = console.session;
  var channel;
  var mode;
  var token;
  var alias;
  var url;

  url = args[1];
  mode = args[2];

  if (!mode || mode == '*') {
    mode = 'readwriteemit';
  }

  for (var i = 2; i < args.length; i++) {
    if (args[i] == 'as') {
      alias = args[i + 1];
      if (i == 2) {
        mode = 'readwriteemit';
      }
      break;
    }
  }

  if (typeof url !== 'string') {
    throw new Error('bad argument, expected URL');
  }

  if (url.indexOf('?') !== -1) {
    token = url.split('?').slice(1).join('');
    url = url.split('?')[0];
  }

  channel = session.openChannel(url, mode, token);

  if (typeof alias == 'string') {
    session.registerAlias(alias, args[1]);
  }

  channel.onopen = function (e) {
    var m = channelModeToConst(this);
    var a = typeof alias == 'string' ? ' as <i>' + alias + '</i>' : '';
    console.echo('Channel <b>%s</b> in mode <b>%s</b> opened %s', url, m, a);
    console.echoIndent(e.data || '<i>&lt;no welcome message&gt;</i>');
    console.initMonitor(ChannelMonitor, this);
    self.exit();
  };

  channel.onerror = function (err) {
    console.echoError('Failed to open channel %s, reason %s', args[1], err.data);
    self.exit();
  };

  return true;
};