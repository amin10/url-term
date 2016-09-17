var local = {}
var commands = {
  'ls' : function(args) {
    alert('ls ' +args);
  },
  'cd' : function(args) {
    alert('cd ' + args);
  },
  'export' : function(args) {
    var tokens = _.map(args.split("="), _.trim);
    var variable=tokens[0];
    var value=tokens[1];
    local[variable] = value;
  }
};

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    console.log(local);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    var words = text.split(" ");
    var cmd = words[0];
    var args = _.join(words.slice(1), " ");
    if (cmd in commands) {
      commands[cmd](args);
    } else {
      alert("No such command, "+cmd);
    }
  });