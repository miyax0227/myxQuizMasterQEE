/*******************************************************************************
 * ルールの読み込み・状態保持・保存を行うサービス
 * @class
 * @name css
 */
app.service('css', [ 'qeditor', function(qeditor) {
  const
  fs = require('fs');
  var cssJsonName;
  var cssScssName;
  var cssCssName;

  // css設定 ----------------------------------------------
  var css = {};
  closeCss();

  css.load = load;
  css.saveCss = saveCss;
  css.closeCss = closeCss;
  css.isJson = qeditor.isJson;
  css.addElement = addElement;
  css.deleteElement = deleteElement;

  return css;

  /*****************************************************************************
   * cssの読み込み
   * @memberOf css
   * @param {string} name ラウンド名
   */
  function load(name) {
	css.name = name;

	cssJsonName = __dirname + "/json/css/" + name + ".json";
	cssScssName = __dirname + "/scss/" + name + ".scss";
	cssCssName = __dirname + "/css/" + name + ".css";

	var cssJson = angular.copy(JSON.parse(fs.readFileSync(cssJsonName, 'utf-8')));

	// includes
	css.includes = cssJson.includes;
	// variables
	css.variables = cssJson.variables;
	// lines
	css.lines = cssJson.lines;
	// items
	css.items = cssJson.items;
	// images
	css.images = cssJson.images;
	// buttons
	css.buttons = cssJson.buttons;
  }

  /*****************************************************************************
   * cssの保存
   * @memberOf css
   */
  function saveCss() {
	var cssJson = {};
	var successLog = [];

	// includes
	cssJson.includes = angular.copy(css.includes);
	// variables
	cssJson.variables = angular.copy(css.variables);
	// lines
	cssJson.lines = angular.copy(css.lines);
	// items
	cssJson.items = angular.copy(css.items);
	// images
	cssJson.images = angular.copy(css.images);
	// buttons
	cssJson.buttons = angular.copy(css.buttons);

	// save to css.json
	fs.writeFile(cssJsonName, JSON.stringify(cssJson), function(err) {
	  if (err) {
		qeditor.alarm(err);
	  } else {
		console.log(cssJsonName + ' is saved.');
		successLog.push('css.json is saved.');

		var tempScss;
		// TODO : edit tempScss.

		fs.writeFile(cssScssName, tempScss, function(err) {
		  if (err) {
			qeditor.alarm(err);
		  } else {
			console.log(cssScssName + 'is saved.');
			successLog.push('css.scss is saved.');
		  }
		});
	  }
	});

  }

  /*****************************************************************************
   * cssを閉じる
   * @memberOf css
   */
  function closeCss() {
	if (css.name) {
	  css.name = null;
	  css.includes = null;
	  css.variables = null;
	  css.lines = null;
	  css.items = null;
	  css.images = null;
	  css.buttons = null;
	}
  }

  /*****************************************************************************
   * 要素の削除
   * @memberOf css
   * @param {string} listName 削除対象のリストの名前
   * @param {int} index 削除対象のindex
   */
  function deleteElement(listName, index) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  css[listName].splice(index, 1);
	});
  }

  /*****************************************************************************
   * 要素の追加
   * @memberOf css
   * @param {string} listName 追加対象のリストの名前
   */
  function addElement(listName) {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  css[listName].push({
		name : result.inputString
	  });
	});
  }
  
} ]);
