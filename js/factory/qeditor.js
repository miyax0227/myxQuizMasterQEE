'use strict';

var appName = "myxQuizEditor";
var app = angular.module(appName);

/*******************************************************************************
 * 共通関数をまとめたサービス
 * @class
 * @name qEditor
 */
app.service('qeditor', [ '$uibModal', '$twitterApi', function($uibModal, $twitterApi) {
  const
  fs = require('fs');
  const
  dialog = require('electron').dialog;
  const
  OauthTwitter = require('electron').remote.require('electron-oauth-twitter');

  // qEditor設定 --------------------------------------------
  var qEditor = {};
  qEditor.copyFile = copyFile;
  qEditor.getFileList = getFileList;
  qEditor.inputBox = inputBox;
  qEditor.confirm = confirm;
  qEditor.alarm = alarm;
  qEditor.isJson = isJson;
  qEditor.beautify = beautify;
  qEditor.loadData = loadData;
  qEditor.addElement = addElement;
  qEditor.deleteElement = deleteElement;
  qEditor.saveData = saveData;
  return qEditor;

  /*****************************************************************************
   * ファイルをコピーする
   * @memberOf qEditor
   * @param {string} from - 元ファイル
   * @param {string} to - 新ファイル
   */
  function copyFile(from, to) {
	fs.createReadStream(from).pipe(fs.createWriteStream(to));
  }

  /*****************************************************************************
   * 特定ディレクトリ配下のファイル/ディレクトリのリストを抽出する
   * @memberOf qEditor
   * @param {string} dir - 探索するディレクトリ
   * @param {boolean} isFile - ファイルを探すか(true), ディレクトリを探すか(false)
   * @param {string} ext - ファイルを探す場合の拡張子
   * @return {array}
   */
  function getFileList(dir, isFile, ext) {
	var list = [];
	var reg = new RegExp("\." + ext + "$");

	fs.readdirSync(dir).forEach(function(file) {
	  // ファイルの場合
	  if (fs.statSync(dir + "/" + file).isFile() && isFile) {
		if (reg.test(file)) {
		  list.push(file.replace(reg, ''));
		}
	  }
	  // ディレクトリの場合
	  if (!fs.statSync(dir + "/" + file).isFile() && !isFile) {
		list.push(file);
	  }
	});
	return list;
  }

  /*****************************************************************************
   * 値を入力するモーダルウィンドウを表示する
   * @memberOf qEditor
   * @param {string} msg 表示するメッセージ
   * @param {function}() func OK押下時に実行する処理
   */
  function inputBox(msg, func) {
	var modal = $uibModal.open({
	  templateUrl : "./template/input-box.html",
	  controller : "modal",
	  resolve : {
		myMsg : function() {
		  return {
			msg : msg
		  };
		}
	  }
	});

	modal.result.then(function(result) {
	  // OKの場合のみ実行
	  func(result);
	}, function() {
	});
  }

  /*****************************************************************************
   * 確認するモーダルウィンドウを表示する
   * @memberOf qEditor
   * @param {string} msg 表示するメッセージ
   * @param {function}() func OK押下時に実行する処理
   */
  function confirm(msg, func) {
	var modal = $uibModal.open({
	  templateUrl : "./template/confirm.html",
	  controller : "modal",
	  resolve : {
		myMsg : function() {
		  return {
			msg : msg
		  };
		}
	  }
	});

	modal.result.then(function(result) {
	  // OKの場合のみ実行
	  func(result);
	}, function() {
	});
  }

  /*****************************************************************************
   * アラームを表示するモーダルウィンドウを表示する
   * @memberOf qEditor
   * @param {string} msg 表示するメッセージ
   */
  function alarm(msg) {
	var modal = $uibModal.open({
	  templateUrl : "./template/alarm.html",
	  controller : "modal",
	  resolve : {
		myMsg : function() {
		  return {
			msg : msg,
			isArray : angular.isArray(msg)
		  };
		}
	  }
	});

	modal.result.then(function() {
	}, function() {
	});
  }

  /*****************************************************************************
   * JSON形式として有効な文字列か判定する
   * @memberOf qEditor
   * @param {string} str 判定対象文字列
   * @return {boolean} trueなら有効
   */
  function isJson(str) {
	try {
	  JSON.parse(str);
	  return true;
	} catch (e) {
	  return false;
	}
  }

  /*****************************************************************************
   * データをロードする
   * @memberOf qEditor
   * @param {string} name - 対象jsonファイル
   * @param {object} scope - $scope
   */
  function loadData(name, scope) {
	switch (name) {
	case "window":
	  break;
	case "twitter":
	  scope.twitter = JSON.parse(fs.readFileSync(__dirname + '/json/twitter.json', 'utf-8'));
	  break;
	}
  }

  /*****************************************************************************
   * 要素を追加する
   * @memberOf qEditor
   * @param {string} name - データの名前
   * @param {object} scope - $scope
   */
  function addElement(name, scope) {
	switch (name) {
	case "window":
	  break;
	case "twitter":
	  var consumerKey = "esh749nGvygSvc9ouTYVkwuPO";
	  var consumerSecret = "VsVuRcKal3g2NfO4zCv4SBLDZ9tz4ioglZiUMaSM44aEk4KCnG";

	  var twitter = new OauthTwitter({
		key : consumerKey,
		secret : consumerSecret
	  });

	  twitter.startRequest().then(function(result) {
		var accessToken = result.oauth_access_token;
		var accessTokenSecret = result.oauth_access_token_secret;

		$twitterApi.configure(consumerKey, consumerSecret, {
		  oauth_token : accessToken,
		  oauth_token_secret : accessTokenSecret
		});

		$twitterApi.getAccountVerifyCredentials().then(function(data) {
		  scope.twitter.accounts.push({
			owner : data.screen_name,
			ownerId : data.id,
			consumerKey : consumerKey,
			consumerSecret : consumerSecret,
			accessToken : accessToken,
			accessTokenSecret : accessTokenSecret
		  });
		}, function(data) {
		  alarm("Twitter連携に失敗しました。"+data);
		});
	  }).catch(function(error){
		  alarm("Twitter連携に失敗しました。"+error);
	  });

	  break;
	}
  }

  /*****************************************************************************
   * 要素を削除する
   * @memberOf qEditor
   * @param {string} name - データの名前
   * @param {number} index - 削除する要素番号
   * @param {object} scope - $scope
   */
  function deleteElement(name, index, scope) {
	switch (name) {
	case "window":
	  break;
	case "twitter":
	  confirm("削除します。よろしいですか？", function() {
		scope.twitter.accounts.splice(index, 1);
	  });
	  break;
	}
  }
  
  /*****************************************************************************
   * 保存する
   * @memberOf qEditor
   * @param {string} name - データの名前
   * @param {object} scope - $scope
   */
  function saveData(name, scope){
	switch(name){
	case "window":
	  break;
	case "twitter":
	  confirm("保存します。よろしいですか？", function() {
		fs.writeFile(__dirname + '/json/twitter.json', JSON.stringify(scope.twitter, undefined, 2));
	  });
	  
	  break;
	}
  }

  /*****************************************************************************
   * コード整形
   * @memberOf qEditor
   * @param {string} code 整形元コード
   * @return {string} 整形後コード
   */
  function beautify(code) {
	return js_beautify(code, {
	  indent_size : 2
	});
	/*
	 * var lines = code.split("\n"); var indent = 0; lines =
	 * lines.map(function(line) { line = line.replace(/^[\s\t]+/, ""); line =
	 * line.replace(/[\s\t]+$/, ""); line = line.replace(/\t/, " "); line =
	 * line.replace(/\s{2,}/, " "); line = " ".repeat((indent -
	 * (line.substring(0, 1) == "}" ? 1 : 0)) * 2) + line; indent +=
	 * line.split("{").length - 1; indent -= line.split("}").length - 1; return
	 * line }); return lines.join("\n");
	 */

  }

} ]);