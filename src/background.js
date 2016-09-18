var DEFAULT_PROTOCOL = "http";
var local = {"HOST" : "TODO"};

var swal = function(o){
  chrome.tabs.executeScript({
    code:"var styles = \"@import url('https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css');\"; \
          var newSS=document.createElement('link'); \
          newSS.rel='stylesheet'; \
          newSS.href='data:text/css,'+escape(styles); \
          document.getElementsByTagName('head')[0].appendChild(newSS); \
          fetch('https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js') \
          .then(response => response.text()) \
          .then(text => eval(text)) \
          .then(() => { swal("+JSON.stringify(o)+") })"
  });
};

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
              var urls = data['result'];
              swal({
                'title' : 'hey',
                'text': '<textarea cols=50>'+JSON.stringify(urls)+'</textarea>',
                'html' : true
              });
            },
            dataType: "json"
          });
        });
      }
    );
  },
  'cd' : function(args) {
    if (args === ''){
      // cd takes you home
      chrome.tabs.executeScript(
        { 
          code: "window.location.href='https://www.google.com/_/chrome/newtab';"
        }, function(output) {}
      );
    } else if (args.startsWith('/')) {
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
            chrome.tabs.update(tabs[0].id, {url: DEFAULT_PROTOCOL + '://' + args});
         });
    }
  },
  export : function(args) {
    var tokens = _.map(args.split("="), _.trim);
    var variable=tokens[0];
    var value=tokens[1];
    local[variable] = value;
  },
  alias : function(args) {
    var tokens = _.map(args.split("="), _.trim);
    var variable = tokens[0];
    var value = tokens[1];   
    commands[variable] = function(args){
      sh(value);
    };
  },
  echo : function(args) {
    var result = args;
    while (result.match('\\$(\\w+)')){
      var m = result.match('\\$(\\w+)');
      var value = "";
      if(m[1] in local){
        value = local[m[1]];
      }
      result = _.replace(result, m[0], value);
    }
    alert(result);
  },
  man : function(args) {
    if (args == '') {
      console.log("args = '': " + true);
      chrome.tabs.query({currentWindow: true, active: true},
      function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: DEFAULT_PROTOCOL + '://' + local["HOST"]});
      });
    } else {

    }
  },
  grep : function(args) {
    urls = ["https://dl.dropboxusercontent.com/s/94u1ewjjzv93014/creenshot%202014-06-17-18-36-44.png?dl=0",
    "https://dl.dropboxusercontent.com/s/94u1ewjjzv93014/creenshot%202014-06-17-18-36-44.png?dl=0",
    "https://dl.dropboxusercontent.com/s/94u1ewjjzv93014/creenshot%202014-06-17-18-36-44.png?dl=0"];
    var imgs = _.join(_.map(urls, function(url){
      return "<img style='width:100px;height:100px;' src='"+url+"'></img>";
    }), "");
    swal({
      title: 'Images',
      text: imgs,
      html: true
    });
  },
  cat : function(args) {
    chrome.tabs.executeScript(
      {
        code: "var out= document.getElementsByTagName('html')[0].innerHTML;\
              document.open('text/html');\
              document.write(\"<html><head></head><body><textarea id='esc'></textarea></body></html>\");\
              document.close();\
              var esc = document.getElementById('esc');\
              esc.textContent= out;\
              document.getElementsByTagName('html')[0].innerHTML = esc.innerHTML;"
      }, 
      function (out1) {
      }
    );
  },
  pwd : function(args) {
    chrome.tabs.executeScript(
      { 
        code: "window.location.href;"
      }, function(output) {
        alert(output);
      }
    );
  },
  ln : function(args) {

  },
  default : function(text) {
    alert('No such command', text);
  }
};

var templates = {
  'ls' : ['ls'],
  'cd' : ['cd', 'cd ..','cd /relative_path', 'cd www.google.com'],
  'export' : ['export val=10'],
  'alias' : ['alias back=cd ..'],
  'echo' : ['echo Hello $name'],
  'man' : ['man'],
  'grep' : [], // TODO
  'cat' : ['cat .'], //TODO
  'pwd' : ['pwd'],
  'ln' : [] // TODO
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
    var cmds = Object.keys(commands);
    var suggestions = [];

    text = _.trim(text);
    var words = text.split(" ");
    var cmd = words[0];
    var args = _.join(words.slice(1), " ");

    if(args){ //User has finished writing the cmd
      if (cmd in templates) {
        _.each(templates[cmd], function(template){
          if (_.startsWith(text, template)){
            suggestions.push({
              content: template,
              description: template
            });
          }
        });
      }
    } else { //User is still typing the cmd
      _.each(templates, function(cmd_templates, cmd){
        if (_.startsWith(cmd, text)){
          _.each(cmd_templates, function(cmd_template){
            suggestions.push({
              content: cmd_template,
              description: cmd_template
            });
          });
        };
      });
    }
    console.log(suggestions);
    suggest(suggestions);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(sh);
