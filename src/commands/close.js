
'use strict';

registerCommand('close', CloseCommand);


function CloseCommand (alias, console) {
  Command.call(this, alias, console);
}


CloseCommand.help = function (console, alias) {
  console.echo('usage: %s url [MESSAGE]', alias);
  console.echo(this.description());
};


CloseCommand.description = function () {
  return 'Close an open channel with optional goodbye message';
};


CloseCommand.prototype = new Command();


CloseCommand.prototype.run = function (args) {
  var self = this;
  var console = this.console;
  var session = console.session;
  var channel;
  var url;

  if (typeof args[1] !== 'string') {
    throw new Error('bad argument, expected URL or ALIAS');
  }

  channel = session.channelByUrlOrAlias(args[1]);

  if (!channel) {
    throw new Error('Channel is not open');
  }

  try {
    session.closeChannel(channel, args[2]);
  } catch (err) {
    console.echoError(err.message);
  }
};