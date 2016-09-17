var commands = {
  'ls' : function(args) {
    alert('ls ' +args);
  },
  'cd' : function(args) {
    alert('cd ' + args);
  }
};

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    var cmd = text.split(" ")[0];
    var args = text.split(" ").slice(1);
    if(cmd in commands){
      commands[cmd](args);
    }else {
      alert("No such command, "+cmd);
    }
  });