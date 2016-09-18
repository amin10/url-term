var local = {"DEFAULT_PROTOCOL" : "http"};
var commands = {
  'ls' : function(args) {
    chrome.tabs.executeScript(
      { 
        code: "document.getElementsByTagName('html')[0].innerHTML;"
      }, 
      function (ps1) {
        chrome.tabs.getSelected(null, function(tab) {
          $.ajax({
            type:"POST",
            url:"http://localhost:5000/find_related",
            data: {
              base: ps1[0] // tab.url
            },
            success: function(data){
              console.log(data);
            },
            dataType: "json"
          });
        });
      }
    );
  },
  'cd' : function(args) {
    if (args.startsWith('/')) {
     // navigate to relative page
     chrome.tabs.query({currentWindow: true, active: true},
        function (tabs) {
           chrome.tabs.update(tabs[0].id, {url: tabs[0].url + args});
        });
    } else if (args === '..') {
      // navigate Back
      chrome.tabs.executeScript(
        { 
          code: "window.history.back();"
        }, function(output) {}
      );
    } else {
      // navigate to absolute page
      chrome.tabs.query({currentWindow: true, active: true},
         function (tabs) {
            chrome.tabs.update(tabs[0].id, {url: local["DEFAULT_PROTOCOL"] + '://' + args});
         });
    }
  },
  'export' : function(args) {
    var tokens = _.map(args.split("="), _.trim);
    var variable=tokens[0];
    var value=tokens[1];
    local[variable] = value;
  },
  alias: function(args) {
    var tokens = _.map(args.split("="), _.trim);
    var variable = tokens[0];
    var value = tokens[1];   
    commands[variable] = function(args){
      sh(value);
    };
  },
  echo: function(args) {
    var result = args;
    while (result.match('\\$(\\w+)')){
      var m = result.match('\\$(\\w+)');
      var value = "";
      if(m[1] in local){
        value = local[m[1]];
      }
      result = _.replace(result, m[0], value);
    }
    console.log("hi");
  },
  source: function(args) {

  },
  man: function(args) {

  },
  grep: function(args) {

  },
  default: function(text) {
    alert('No such command', text);
  }
};

var sh = function(text) {
  text = _.trim(text);
  var words = text.split(" ");
  var cmd = words[0];
  var args = _.join(words.slice(1), " ");
  if (cmd in commands) {
    commands[cmd](args);
  } else {
    commands['default'](text);
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
chrome.omnibox.onInputEntered.addListener(sh);
