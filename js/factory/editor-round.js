/*******************************************************************************
 * ラウンドの読み込み・状態保持・保存を行うサービス
 * @class
 * @name round
 */
app.service('round', [ 'qeditor', function(qeditor) {
  const
  fs = require('fs');

  var boardJsonName;
  var boardHtmlName;
  var entryJsonName;
  var propertyJsonName;

  // round設定 ----------------------------------------------
  var round = {};
  closeRound();

  round.load = load;
  round.saveRound = saveRound;
  round.closeRound = closeRound;
  round.deleteProperty = deleteProperty;
  round.addProperty = addProperty;
  round.isJson = qeditor.isJson;
  return round;

  /*****************************************************************************
   * roundの読み込み
   * @memberOf round
   * @param {string} name ラウンド名
   */
  function load(name) {
	round.name = name;

	boardJsonName = __dirname + "/round/" + name + "/" + "board.json";
	boardHtmlName = __dirname + "/round/" + name + "/" + "board.html";
	entryJsonName = __dirname + "/round/" + name + "/" + "entry.json";
	propertyJsonName = __dirname + "/round/" + name + "/" + "property.json";

	round.board = angular.copy(JSON.parse(fs.readFileSync(boardJsonName, 'utf-8')));
	round.entry = angular.copy(fs.readFileSync(entryJsonName, 'utf-8'));

	round.property = {};
	var propertyJson = JSON.parse(fs.readFileSync(propertyJsonName, 'utf-8'))[0];
	angular.forEach(propertyJson, function(value, key) {
	  round.property[key] = JSON.stringify(value);
	});

  }

  /*****************************************************************************
   * roundの保存
   * @memberOf round
   */
  function saveRound() {
	var successLog = [];
	qeditor.confirm(round.name + "を上書き保存してよろしいですか?", function(result) {
	  // board.json
	  console.log(angular.copy(round.board));
	  fs.writeFile(boardJsonName, JSON.stringify(round.board), function(err) {
		if (err) {
		  qeditor.alarm(err);
		} else {
		  console.log(boardJsonName + ' is saved.');
		  successLog.push('board.json is saved.');

		  // board.html
		  var tempHtml = fs.readFileSync("./template/temp-board.html", 'utf-8');
		  tempHtml = tempHtml.replace(/\$\{css\}/g, round.board.css);
		  tempHtml = tempHtml.replace(/\$\{rule\}/g, round.board.rule);
		  tempHtml = tempHtml.replace(/\$\{title\}/g, round.board.title);
		  tempHtml = tempHtml.replace(/\$\{status\}/g, round.board.status);
		  if (round.board.victory) {
			tempHtml = tempHtml.replace(/\$\{victory\}/g, "<div victory></div>");
		  } else {
			tempHtml = tempHtml.replace(/\$\{victory\}/g, "");
		  }

		  fs.writeFile(boardHtmlName, tempHtml, function(err) {
			if (err) {
			  qeditor.alarm(err);
			} else {
			  console.log(boardHtmlName + 'is saved.');
			  successLog.push('board.html is saved.');
			}
		  });
		}
	  });

	  // entry.json
	  fs.writeFile(entryJsonName, round.entry, function(err) {
		if (err) {
		  qeditor.alarm(err);
		} else {
		  console.log(entryJsonName + 'is saved.');
		  successLog.push('entry.json is saved.');
		}
	  });

	  // property.json
	  var propertyJson = {};
	  var errJson = {};
	  angular.forEach(round.property, function(value, key) {
		if (qeditor.isJson(value)) {
		  propertyJson[key] = JSON.parse(value);
		} else {
		  errJson[key] = value;
		}
	  });

	  if (Object.keys(errJson).length > 0) {
		qeditor.alarm("JSON形式ではないvalueがあります.\n" + JSON.stringify(errJson));
	  } else {
		fs.writeFile(propertyJsonName, JSON.stringify([ propertyJson ]), function(err) {
		  if (err) {
			qeditor.alarm(err);
		  } else {
			console.log(propertyJsonName + 'is saved.');
			successLog.push('property.json is saved.');
		  }
		});
	  }
	  qeditor.alarm(successLog);
	});

  }

  /*****************************************************************************
   * roundを閉じる
   * @memberOf round
   */
  function closeRound() {
	if (round.name) {
	  round.board = {};
	  round.board.rule = "";
	  round.board.css = "";
	  round.board.victory = false;
	  round.board.title = "";
	  round.board.status = "";
	  round.entry = "";
	  round.property = {};
	  round.name = null;
	  return;
	}
  }

  /*****************************************************************************
   * propertyのkey削除
   * @memberOf round
   * @param {string} key 削除対象のkey
   */
  function deleteProperty(key) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  delete round.property[key];
	});
  }

  /*****************************************************************************
   * propertyの追加
   * @memberOf round
   */
  function addProperty() {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  round.property[result.inputString] = null;
	});
  }

} ]);
