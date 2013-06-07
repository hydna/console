
'use strict';

registerCommand('emit', EmitCommand);


function EmitCommand (alias, console) {
  Command.call(this, alias, console);
}


EmitCommand.help = function (console, alias) {
  console.echo('usage: %s url [MESSAGE]', alias);
  console.echo(this.description());
};


EmitCommand.description = function () {
  return 'Emit a message to specifed channel';
};


EmitCommand.prototype = new Command();


EmitCommand.prototype.run = function (args) {
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
    channel.emit(args[2]);
  } catch (err) {
    console.echoError(err.message);
  }
};