
'use strict';

registerCommand('help', HelpCommand);


function HelpCommand (console, alias) {
  Command.call(this, console, alias);
}


HelpCommand.usage = function (alias) {
  return alias + ' [command]';
};


HelpCommand.help = function () {
  return 'Shows help about specific command';
};


HelpCommand.description = function () {
  return 'Shows help about specific command';
};


HelpCommand.prototype = new Command();


HelpCommand.prototype.run = function (args) {
  var console = this.console;
  var self = this;
  var view = this.view;
  var commands;
  var command;

  if (args.length > 1) {
    if (!(command = console.commandByAlias(args[1]))) {
      console.echoError('%s: Command not found %s', args[0], args[1]);
      return;
    }
    if (typeof command.help !== 'function') {
      console.echoError('Command "%s" is missing a help section', args[1]);
      return; 
    }
    command.help(console, args[1]);
  } else {
    commands = console.scopeCommands();
    commands = commands.map(function (item) {
      var command = item[0], aliases = item[1];
      return ['<b>' + aliases.join(',') + '</b>', '<i>' + command.description() + '</i>'];
    });
    console.echo('Online help for hydna console');
    console.echo('');
    console.echo('Available commands: ');
    console.echoTable(commands);
  }

};
