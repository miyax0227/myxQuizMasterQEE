/*******************************************************************************
 * ルールの読み込み・状態保持・保存を行うサービス
 * @class
 * @name css
 */
app.service('css', [ 'qeditor', function(qeditor) {
  const
  fs = require('fs');
  const
  exec = require('child_process').exec;

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
	css.openItems = cssJson.openItems;
	css.closeItems = cssJson.closeItems;
	// images
	css.rankImages = cssJson.rankImages;
	css.statusImages = cssJson.statusImages;
	css.motionImages = cssJson.motionImages;
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
	cssJson.openItems = angular.copy(css.openItems);
	cssJson.closeItems = angular.copy(css.closeItems);
	// images
	cssJson.rankImages = angular.copy(css.rankImages);
	cssJson.statusImages = angular.copy(css.statusImages);
	cssJson.motionImages = angular.copy(css.motionImages);
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
		tempScss = angular.copy(fs.readFileSync(__dirname + '/template/temp-css', 'utf-8'));

		// includes
		tempScss = tempScss.replace('${includes}', cssJson.includes.map(function(e) {
		  return '@import "' + e.name + '.scss";';
		}).join('\n'));

		// variables
		tempScss = tempScss.replace('${variables}', cssJson.variables.map(function(e) {
		  return '$' + e.name + ': ' + e.value + ';';
		}).join('\n'));

		// lines etc.
		angular.forEach([ {
		  key : 'lines',
		  tag : 'hr',
		  include : 'player-hr'
		}, {
		  key : 'openItems',
		  tag : 'div',
		  include : 'player-item'
		}, {
		  key : 'closeItems',
		  tag : 'div',
		  include : 'player-item'
		}, {
		  key : 'rankImages',
		  tag : 'img',
		  include : 'player-img'
		}, {
		  key : 'statusImages',
		  tag : 'img',
		  include : 'player-img'
		}, {
		  key : 'motionImages',
		  tag : 'img',
		  include : 'player-img'
		}, {
		  key : 'buttons',
		  tag : 'div',
		  include : 'player-button'
		} ], function(value) {
		  tempScss = tempScss.replace('${' + value.key + '}', cssJson[value.key].map(function(e) {
			var str = "";

			if (e.name == "") {
			  str += value.tag + ' {\n';
			} else {
			  str += value.tag + '.' + e.name + ' {\n';
			}

			if (e.invisible) {
			  str += 'display: none;\n';
			} else {
			  str += '@include ' + value.include + '(' + e.left + ',' + e.top;
			  if (e.width) {
				str += "," + e.width;
				if (e.height) {
				  str += "," + e.height;
				}
			  }
			  str += ');\n';
			}

			if (e.vertical) {
			  str += '-webkit-writing-mode: vertical-rl;\n';
			  str += '-webkit-text-orientation: upright;\n';
			}

			if (e.rest) {
			  str += e.rest;
			}

			str += '}\n';

			return str;
		  }).join('\n'));
		});

		// beautify
		tempScss = css_beautify(tempScss, {
		  'indent_size' : 2
		});

		fs.writeFile(cssScssName, tempScss, function(err) {
		  if (err) {
			qeditor.alarm(err);
		  } else {
			console.log(cssScssName + 'is saved.');
			successLog.push('css.scss is saved.');

			// var cmd = "node-sass \"" + cssScssName + "\" \"" + cssCssName +
			// "\"";
			var cmd = "node \"" + __dirname + "/node_modules/node-sass/bin/node-sass\" ";
			cmd += "\"" + cssScssName + "\" \"" + cssCssName + "\"";

			exec(cmd, function(err, stdout, stderr) {
			  if (err) {
				qeditor.alarm(err);
				qeditor.alarm(stdout);
				qeditor.alarm(stderr);
			  } else {
				qeditor.alarm(stderr);
			  }
			});
			qeditor.alarm(successLog);
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
