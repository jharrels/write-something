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
var selectedNodeId;
var $treeObj;
var prefs = loadPrefs();
var [library, libraryMetadata] = loadLibrary();
repositionUI();
$treeObj = $("#libraryTree").tree({
  animationSpeed: 50,
  data: library,
  autoOpen: true,
  dragAndDrop: true,
  autoEscape: false,
  onCanMoveTo: function(moved_node, target_node, position) {
        if (target_node.is_menu) {
            // Example: can move inside menu, not before or after
            return (position == 'inside');
        }
        else {
            return true;
        }
    }
});

/* ----------------------------------------------------------------------------
   EVENT HANDLERS
---------------------------------------------------------------------------- */
$('#libraryTree').on(
    'tree.contextmenu',
    function(event) {
        var node = event.node;
        selectedNodeId = node.id;
        const menu = new Menu();
        menu.append(new MenuItem({
          label: "New Folder",
          click() {
            $("#input-modal-folder-name").val("");
            showModal("modal-folder");
            $("#modal-folder .modal-content .modal-title").html("New Folder");
            $("#modal-folder .modal-content .modal-body input").focus();
          }
      }));
      if (node.id > 1) {
          menu.append(new MenuItem({
              label: "Edit Folder",
              click() {
                $("#input-modal-folder-name").val("");
                showModal("modal-folder");
                $("#modal-folder .modal-content .modal-title").html("New Folder");
                $("#modal-folder .modal-content .modal-body input").focus();
              }

          }));
      }
      menu.popup({window: remote.getCurrentWindow()});
    }
);

$('#libraryTree').on(
    'tree.dblclick',
    function(event) {
        var node = event.node;
          $(node).html("");
    }
);


$("#button-modal-folder-cancel").on("click", function() {
  hideModal("modal-folder");
});

$("#button-modal-folder-ok").on("click", function() {
  let parentNode = $treeObj.tree('getNodeById', selectedNodeId);
  let newName = $("#input-modal-folder-name").val();
  $treeObj.tree('appendNode', {name: '<i class="fas fa-folder"></i> '+newName, children: [], id: libraryMetadata['nextId']}, parentNode);
  let newNode = $treeObj.tree('getNodeById', libraryMetadata['nextId']);
  $treeObj.tree('selectNode', newNode);
  libraryMetadata['nextId']++;
  hideModal("modal-folder");
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

function showModal(modalId) {
  $(`#${modalId}`).css({
    "display": "flex",
  });
}

function hideModal(modalId) {
  $(`#${modalId}`).css({
    "display": "none",
  });
}

/* ----------------------------------------------------------------------------
   PREFERENCE FUNCTIONS
---------------------------------------------------------------------------- */
function loadPrefs() {
  let prefs = store.get('prefs');
  if (prefs === undefined) prefs = {};
  return prefs;
}
/* ----------------------------------------------------------------------------
   LIBRARY FUNCTIONS
---------------------------------------------------------------------------- */
function loadLibrary() {
  if (!prefs.hasOwnProperty("libraryPath")) prefs['libraryPath'] = app.getPath('documents')+"/Write Something! Library";
  try {
    fs.accessSync(prefs['libraryPath'], fs.constants.R_OK);
  } catch(err) {
    fs.mkdirSync(prefs['libraryPath']);
  }
  try {
    let data = fs.readFile(prefs['libraryPath'] + "/library.json", 'utf8');
    data = JSON.parse(data);
    return [data['library'], data['metadata']];
  } catch(err) {
    let libraryData =  [{name: '<i class="fas fa-book-open"></i> Library', children: [], id: 1}];
    let libraryMetadata = {nextId: 2};
    return [libraryData, libraryMetadata];
  }
}

function saveLibrary() {
  console.log(library);
  let librarySaveData = $treeObj.tree('toJson');
  let librarySaveMetadata = JSON.stringify(libraryMetadata);
  let saveData = `{"library":${librarySaveData}, "metadata":${librarySaveMetadata}}`;
  fs.writeFile(prefs['libraryPath'] + "/library.json", saveData, 'utf8', (err) => {
    if(err) {
        throw err;
    }
  });
}

function addItemToLibrary(parentId, itemName, itemIcon) {

}
