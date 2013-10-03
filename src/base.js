
'use strict';


var allCommands = {};
var scopeCommands = {};


function registerCommand (alias, scope, command) {

  if (typeof scope == 'function') {
    command = scope;
    scope = '*';
  }

  if (alias in allCommands) {
    throw new Error('Command with alias "' + alias + '" is already registered');
  }

  allCommands[alias] = command;

  if (scope in scopeCommands == false) {
    scopeCommands[scope] = {};
  }

  scopeCommands[scope][alias] = command;
}


function createRow () {
  var fragment;
  var row;

  row = document.createElement('li');
  fragment = document.createDocumentFragment();
  fragment.appendChild(row);

  return row;
}


function format () {
  var args = Array.prototype.slice.call(arguments, 0);
  var idx = 1;
  return args[0].replace(/\%s/g, function () { return args[idx++]; });
}


function Console () {

  this.session = new Session();

  this._view = null;
  this._output = null;
  this._cmdinput = null;

  this._monitors = [];
  this._runningCommand = null;

  if (typeof localStorage == 'object') {
    try {
      this._history = JSON.parse(localStorage['commandHistory']);
    } catch (err) {
      this._history = [];
    }
  } else {
    this._history = [];
  }

  this._initInterfaces();
}


Console.prototype._initInterfaces = function () {
  var self = this;
  var wrapper;
  var tmp;

  function onkeydown (e) {
    if (self._processKey(e.which || e.keyCode)) {
      e.preventDefault();
    }
  }

  this._view = document.createElement('div');
  this._output = document.createElement('ul');
  this._output.className = 'message-list';
  this._cmdinput = document.createElement('input');

  wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  wrapper.appendChild(this._cmdinput);

  tmp = document.createElement('div');
  tmp.className = 'input-field';
  tmp.appendChild(wrapper);

  this._view.appendChild(this._output);
  this._view.appendChild(tmp);

  if (this._cmdinput.attachEvent) {
    this._cmdinput.attachEvent('onkeydown', onkeydown);
  } else {
    this._cmdinput.addEventListener('keydown', onkeydown, false);
  }
};


Console.prototype.pushHistory = function (expr, asc) {
  if (!expr || !expr.length) return;
  asc ? this._history.push(expr) : this._history.unshift(expr);
  if (typeof localStorage == 'object') {
    localStorage['commandHistory'] = JSON.stringify(this._history);
  }
};


Console.prototype.popHistory = function (asc) {
  var expr;
  expr = asc ? this._history.pop() : this._history.shift();
  if (typeof localStorage == 'object') {
    localStorage['commandHistory'] = JSON.stringify(this._history);
  }
  return expr || '';
};


Console.prototype.clearHistory = function () {
  this._history = [];
  if (typeof localStorage == 'object') {
    localStorage['commandHistory'] = null;
  }
};


Console.prototype.appendTo = function (parent) {
  parent.appendChild(this._view);
};


Console.prototype.focus = function () {
  this._cmdinput.focus();
};


Console.prototype.exec = function (expr) {
  var args = shellQuoteParse(expr);
  var command;
  var async;

  if (!(command = this.initCommandByAlias(args[0]))) {
    this.echoError('Command not found %s', args[0]);
    return;
  }

  try {
    async = command.run(args);
  } catch (err) {
    this.echoError(err.message);
  }

  if (async) {
    this._runningCommand = command;
    this._runningCommand.onexit = function () {
      
    };
  }
};


Console.prototype.initMonitor = function (Constructor, arg) {
  var monitors = this._monitors;
  var monitor = new Constructor(this, arg);
  monitor.onclose = function () {
    var idx = monitors.indexOf(this);
    monitors.splice(idx, 1);
  };
  monitors.push(monitor);
  return monitor;
};


Console.prototype.initCommandByAlias = function (alias) {
  var currentScope = '*';
  var constructor;
  var instance;

  constructor = (scopeCommands[currentScope] || {})[alias];

  if (constructor == null) {
    return null;
  }

  instance = new constructor(this, alias);

  return instance;
};


Console.prototype.clear = function () {
  this._output.innerHTML = '';
};


Console.prototype.echoTable = function (tabular, maxWidth) {
  var table;
  var row;
  var tr;
  var td;

  row = createRow();

  table = document.createElement('table');
  row.appendChild(table);

  for (var i = 0; i < tabular.length; i++) {
    tr = document.createElement('tr');
    for (var i2 = 0; i2 < tabular[i].length; i2++) {
      td = document.createElement('td');
      td.innerHTML = tabular[i][i2];
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  if (maxWidth) {
    table.style.width = maxWidth;
  }

  return this._appendRow(row);
};


Console.prototype.echo = function () {
  var row = createRow();
  var text = format.apply(null, arguments);
  row.innerHTML = text;
  return this._appendRow(row);
};


Console.prototype.echoIndent = function () {
  var row = this.echo.apply(this, arguments);
  row.className = 'indent';
  return row;
};


Console.prototype.echoError = function (text) {
  var row = this.echo.apply(this, arguments);
  row.className = 'error';
  return row;
};


Console.prototype.commandByAlias = function (alias) {
  var currentScope = '*';

  return (scopeCommands[currentScope] || {})[alias] || null;
};


Console.prototype.scopeCommands = function () {
  var currentScope = '*';
  var result = [];

  for (var k in scopeCommands[currentScope]) {
    // TODO: search for same commands and group them with aliases
    result.push([scopeCommands[currentScope][k], [k]]);
  }

  return result;
};

Console.prototype._processKey = function (keycode) {
  var expr = this._cmdinput.value;

  switch (true) {

    case keycode == 13:
    this.pushHistory(expr, true);
    this._cmdinput.value = '';
    return this.exec(expr);

    case keycode == 38:
    this.pushHistory(expr, false);
    this._cmdinput.focus();
    this._cmdinput.value = '';
    this._cmdinput.value = this.popHistory(true);
    return true;

    case keycode == 40:
    this.pushHistory(expr, true);
    this._cmdinput.focus();
    this._cmdinput.value = '';
    this._cmdinput.value = this.popHistory(false);
    return true;

  }
}


Console.prototype._appendRow = function (row) {
  var fragment = row.parentNode;
  this._output.appendChild(fragment.cloneNode(true));
  this._output.scrollTop = this._output.clientHeight + 10000;
  return this._output.lastChild;
};




function Command (console, alias) {
  if (console) {
    this.console = console;
  }
  if (alias) {
    this.alias = alias;
  }
}

Command.prototype.run = function () { return true; };

Command.prototype.exit = function () { return true; };