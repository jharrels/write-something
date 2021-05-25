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

var scummvmConfig = {};
var scummyConfig = {};
var tempConfig = {};
var installed;
var selectedGame = "";
var selectedConfig = "";
var importGamePath = "";
var audioDevices = [];

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
var listMode = store.get('listMode');
if (listMode === undefined) listMode = "gallery";
var favorites = store.get('favorites');
if (favorites === undefined) favorites = [];
var defaultVersion = store.get('defaultVersion');
if (defaultVersion === undefined) defaultVersion = {};
var selectedCategory = store.get('selectedCategory');
if (selectedCategory === undefined) selectedCategory = "all";
var recentList = store.get('recentList');
if (recentList === undefined) recentList = [];
var scummyConfig = store.get('scummyConfig');
if (scummyConfig === undefined) scummyConfig = {};

repositionUI();

$(".button").on("click", function() {
  alert("clicked!");
});

function repositionUI() {
  $("#divider-library").css({"left":$("#pane-library").width()-3});
}
