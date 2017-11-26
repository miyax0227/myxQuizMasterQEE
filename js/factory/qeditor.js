
/*******************************************************************************
 * 共通関数をまとめたサービス
 * @class
 * @name qEditor
 */
app.service('qeditor', [ '$uibModal', function($uibModal) {
  const
  fs = require('fs');

  // qEditor設定 --------------------------------------------
  var qEditor = {};
  qEditor.copyFile = copyFile;
  qEditor.getFileList = getFileList;
  qEditor.inputBox = inputBox;
  qEditor.confirm = confirm;
  qEditor.alarm = alarm;
  qEditor.isJson = isJson;
  qEditor.beautify = beautify;
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
	var reg = new RegExp("^.+\." + ext + "$");

	fs.readdirSync(dir).forEach(function(file) {
	  // ファイルの場合
	  if (fs.statSync(dir + "/" + file).isFile() && isFile) {
		if (reg.test(file)) {
		  list.push(file);
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
		  }
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
		  }
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
			msg : msg
		  }
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
   * コード整形
   * @memberOf qEditor
   * @param {string} code 整形元コード
   * @return {string} 整形後コード
   */
  function beautify(code) {
	var lines = code.split("\n");
	var indent = 0;

	lines = lines.map(function(line) {
	  line = line.replace(/^[\s\t]+/, "");
	  line = line.replace(/[\s\t]+$/, "");
	  line = line.replace(/\t/, " ");
	  line = line.replace(/\s{2,}/, " ");
	  line = " ".repeat((indent - (line.substring(0, 1) == "}" ? 1 : 0)) * 2) + line;
	  indent += line.split("{").length - 1;
	  indent -= line.split("}").length - 1;
	  return line
	});

	return lines.join("\n");
  }

} ]);