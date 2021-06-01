const { dialog } = require('electron').remote;
const path = require('path');
const os = require('os');
const fs = require('fs')
const { remote } = require('electron')
const app = remote.app
const { Menu, MenuItem } = remote
const electron = require('electron');
const { spawn } = require('child_process');
const ini = require('ini');

const electronScreen = require('electron').screen;
const Store = require('electron-store');
const store = new Store();
const customTitlebar = require('custom-electron-titlebar');

const template = [
   {
      label: 'Edit',
      submenu: [
         {
            role: 'undo'
         },
         {
            role: 'redo'
         },
         {
            type: 'separator'
         },
         {
            role: 'cut'
         },
         {
            role: 'copy'
         },
         {
            role: 'paste'
         }
      ]
   },

   {
      label: 'View',
      submenu: [
         {
            role: 'reload'
         },
         {
            role: 'toggledevtools'
         },
         {
            type: 'separator'
         },
         {
            role: 'resetzoom'
         },
         {
            role: 'zoomin'
         },
         {
            role: 'zoomout'
         },
         {
            type: 'separator'
         },
         {
            role: 'togglefullscreen'
         }
      ]
   },

   {
      role: 'window',
      submenu: [
         {
            role: 'minimize'
         },
         {
            role: 'close'
         }
      ]
   },

   {
      role: 'help',
      submenu: [
         {
            label: 'Learn More'
         }
      ]
   }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu);

let titlebar = new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#ddd'),
  menu: null,
  overflow: "hidden"
});

/* ----------------------------------------------------------------------------
   LOAD PREFS AND SETUP THE GUI AT LAUNCH
---------------------------------------------------------------------------- */
var prefs = loadPrefs();
var library = loadLIbrary();
repositionUI();

$(".button").on("click", function() {
  alert("clicked!");
});

$("#divider-library").draggable({ containment: "parent", axis: "x",
    drag: function() {
        let position = $("#divider-library").position();
        let viewportWidth = window.outerWidth;
        let maxWidth = viewportWidth * .35;
        let minWidth = viewportWidth * .15;
        if ((position.left >= minWidth) && (position.left <= maxWidth)) {
          $("#pane-library").width(position.left + 5);
          $("#pane-documents").css({"left": position.left+6});
          let libraryWidth = $("#pane-library").width();
          let documentsWidth = $("#pane-documents").width();
          $("#pane-editor").width(viewportWidth - libraryWidth - documentsWidth)
            .css({"left": documentsWidth + libraryWidth});
        }
    },
    stop: function() {
      $("#divider-library").css({"left":$("#pane-library").width()-5});
      $("#divider-documents").css({"left":$("#pane-documents").width()+$("#pane-library").width()-5});
    }
});

$("#divider-documents").draggable({ containment: "parent", axis: "x",
    drag: function() {
        let position = $("#divider-documents").position();
        let viewportWidth = window.outerWidth;
        let maxWidth = viewportWidth * .35;
        let minWidth = viewportWidth * .15;
        let libraryWidth = $("#pane-library").width();
        if ((position.left - libraryWidth >= minWidth) && (position.left - libraryWidth <= maxWidth)) {
          $("#pane-documents").width(position.left - libraryWidth + 5);
          let documentsWidth = $("#pane-documents").width();
          $("#pane-editor").width(viewportWidth - libraryWidth - documentsWidth)
            .css({"left": documentsWidth + libraryWidth});
        }
    },
    stop: function() {
      $("#divider-documents").css({"left":$("#pane-documents").width()+$("#pane-library").width()-5});
    }
});

/* ----------------------------------------------------------------------------
   UI FUNCTIONS
---------------------------------------------------------------------------- */
function repositionUI() {
  let viewportWidth = window.outerWidth;
  $("#divider-library").css({"left":$("#pane-library").width()-5});
  $("#divider-documents").css({"left":$("#pane-documents").width()+$("#pane-library").width()-5});
  if (os.type() == 'Darwin') {
  } else {
    $("#button-bar-editor").css({"left":viewportWidth - $(".window-controls-container").width() - $("#button-bar-editor").width()});
  }
}

/* ----------------------------------------------------------------------------
   PREFERENCE FUNCTIONS
---------------------------------------------------------------------------- */
function loadPrefs() {
  let prefs = store.get('prefs');
  if (prefs === undefined) prefs = {};
  return prefs;
}

function loadLibrary() {
  if (!prefs.hasOwnProperty("libraryPath")) prefs['libraryPath'] = app.getPath(documents);
  fs.readFile('${libraryPath}/library.json', 'utf8', (err, data) => {
    if (err) {
      console.log("Whoops!");
    } else {
      return JSON.parse(data);
    }
  };
}
