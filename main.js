'use strict';

// Electronのモジュール
const electron = require("electron");

// アプリケーションをコントロールするモジュール
const app = electron.app;

// gcを許可する
app.commandLine.appendSwitch('js-flags', '--expose-gc');

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

/**
 * メニューバーからDeveloper Toolを起動するためのコード アプリ化時特有のバグ追跡時に使用すること const Menu =
 * electron.Menu; var menu = Menu.buildFromTemplate([ { label : 'Toggle
 * DevTools', accelerator : 'Alt+Command+I', click : function() {
 * BrowserWindow.getFocusedWindow().toggleDevTools(); } } ]);
 * Menu.setApplicationMenu(menu);
 */

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// Electronの初期化完了後に実行
app.on('ready', function () {
  // deprecation警告を出力しない
  process.noDeprecation = true;

  var fs = require('fs');
  var data = JSON.parse(fs.readFileSync(__dirname + '/json/window.json', 'utf-8'));

  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({
    width: data[1].width,
    height: data[1].height,
    x: data[1].left,
    y: data[1].top
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function () {
    mainWindow = null;

  });

});
