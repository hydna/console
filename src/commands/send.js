
'use strict';

registerCommand('send', SendCommand);


function SendCommand (alias, console) {
  Command.call(this, alias, console);
}


SendCommand.help = function (console, alias) {
  console.echo('usage: %s url [PRIORITY] [MESSAGE]', alias);
  console.echo(this.description());
};


SendCommand.description = function () {
  return 'Send a message to specifed channel';
};


SendCommand.prototype = new Command();


SendCommand.prototype.run = function (args) {
  var self = this;
  var console = this.console;
  var session = console.session;
  var channel;
  var url;

  if (typeof args[1] !== 'string') {
    throw new Error('bad argument, expected URL or ALIAS');
  }

  if (typeof args[2] !== 'string') {
    throw new Error('bad argument, expected MESSAGE');
  }

  channel = session.channelByUrlOrAlias(args[1]);

  if (!channel) {
    throw new Error('Channel is not open');
  }

  try {
    channel.send(args[2]);
  } catch (err) {
    console.echoError(err.message);
  }
};