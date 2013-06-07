
'use strict';

registerCommand('clear', ClearCommand);


function ClearCommand (alias, console) {
  Command.call(this, alias, console);
}

ClearCommand.help = function (console, alias) {
  console.echo('usage: %s [HISTORY|SCREEN]', alias);
  console.echo('Clears screen or history. Default is screen');
};


ClearCommand.description = function () {
  return "Clears all message in the console or history"
};


ClearCommand.prototype = new Command();



ClearCommand.prototype.run = function (args) {
  if (args[1] && args[1].toLowerCase() == 'history') {
    this.console.clearHistory();
  } else {
    this.console.clear();
  }
};