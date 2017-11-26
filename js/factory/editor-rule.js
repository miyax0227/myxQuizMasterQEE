/*******************************************************************************
 * ルールの読み込み・状態保持・保存を行うサービス
 * @class
 * @name rule
 */
app.service('rule', [ 'qeditor', function(qeditor) {
  const
  fs = require('fs');
  var editor = {};
  var editorActionEnable;
  var editorActionAction;
  var editorGlobalActionEnable;
  var editorGlobalActionAction;
  var editorGlobalActionRepeatEnable;
  var editorGlobalActionRepeatAction;
  var editorJudgement;
  var editorCalc;

  var ruleJsonName;
  var ruleJsName;

  // rule設定 ----------------------------------------------
  var rule = {};
  closeRule();

  rule.load = load;
  rule.saveRule = saveRule;
  rule.closeRule = closeRule;
  rule.isJson = qeditor.isJson;
  rule.beautifyCode = beautifyCode;
  rule.insertCode = insertCode;
  rule.deleteHeader = deleteHeader;
  rule.addHeader = addHeader;
  rule.deleteItem = deleteItem;
  rule.addItem = addItem;
  rule.deletePriority = deletePriority;
  rule.addPriority = addPriority;
  rule.deleteTweet = deleteTweet;
  rule.addTweet = addTweet;
  
  return rule;

  /*****************************************************************************
   * ace設定
   * @memberOf rule
   */
  function setAce() {
	// editorActionEnable
	if (!editorActionEnable) {
	  editorActionEnable = ace.edit("board-status");
	  editorActionEnable.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorActionEnable.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorActionAction
	if (!editorActionAction) {
	  editorActionAction = ace.edit("board-status");
	  editorActionAction.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorActionAction.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorGlobalActionEnable
	if (!editorGlobalActionEnable) {
	  editorGlobalActionEnable = ace.edit("board-status");
	  editorGlobalActionEnable.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorGlobalActionEnable.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorGlobalActionAction
	if (!editorGlobalActionAction) {
	  editorGlobalActionAction = ace.edit("board-status");
	  editorGlobalActionAction.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorGlobalActionAction.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorGlobalActionRepeatEnable
	if (!editorGlobalActionRepeatEnable) {
	  editorGlobalActionRepeatEnable = ace.edit("board-status");
	  editorGlobalActionRepeatEnable.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorGlobalActionRepeatEnable.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorGlobalActionRepeatAction
	if (!editorGlobalActionRepeatAction) {
	  editorGlobalActionRepeatAction = ace.edit("board-status");
	  editorGlobalActionRepeatAction.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity
	  });
	  editorGlobalActionRepeatAction.getSession().setOptions({
		mode : "ace/mode/html",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorJudgement
	if (!editorJudgement) {
	  editorJudgement = ace.edit("editor-judgement");
	  editorJudgement.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity,
		enableBasicAutocompletion : true,
		enableSnippets : true,
		enableLiveAutocompletion : true
	  });
	  editorJudgement.getSession().setOptions({
		mode : "ace/mode/javascript",
		wrap : true,
		tabSize : 2
	  });
	}

	// editorCalc
	if (!editorCalc) {
	  editorCalc = ace.edit("editor-calc");
	  editorCalc.setOptions({
		theme : "ace/theme/monokai",
		fontSize : 14,
		maxLines : Infinity,
		enableBasicAutocompletion : true,
		enableSnippets : true,
		enableLiveAutocompletion : true
	  });
	  editorCalc.getSession().setOptions({
		mode : "ace/mode/javascript",
		wrap : true,
		tabSize : 2
	  });
	}

	editor["editorActionEnable"] = editorActionEnable;
	editor["editorActionAction"] = editorActionAction;
	editor["editorGlobalActionEnable"] = editorGlobalActionEnable;
	editor["editorGlobalActionAction"] = editorGlobalActionAction;
	editor["editorGlobalActionRepeatEnable"] = editorGlobalActionRepeatEnable;
	editor["editorGlobalActionRepeatAction"] = editorGlobalActionRepeatAction;
	editor["editorJudgement"] = editorJudgement;
	editor["editorCalc"] = editorCalc;
  }

  /*****************************************************************************
   * ruleの読み込み
   * @memberOf round
   * @param {string} name ラウンド名
   */
  function load(name) {
	rule.name = name;
	setAce();

	ruleJsonName = __dirname + "/js/rule/" + name + "on";
	ruleJsName = __dirname + "/js/rule/" + name;

	var ruleJson = angular.copy(JSON.parse(fs.readFileSync(ruleJsonName, 'utf-8')));
	// headers
	rule.headers = ruleJson.headers;
	angular.forEach(rule.headers, function(header) {
	  if (!header.hasOwnProperty('style')) {
		header.style = "null";
		header.value = "";
	  }
	});

	// items
	rule.items = ruleJson.items;
	angular.forEach(rule.items, function(item) {
	  if (!item.hasOwnProperty('style')) {
		item.style = "null";
		item.value = "";
	  }
	  if (!item.hasOwnProperty('css')) {
		item.css = "";
	  }
	  if (!item.hasOwnProperty('prefix')) {
		item.prefix = "";
	  }
	  if (!item.hasOwnProperty('suffix')) {
		item.suffix = "";
	  }
	});

	// priorities
	rule.priorities = ruleJson.priority;
	angular.forEach(rule.priorities, function(priority) {
	  if (!priority.hasOwnProperty('alter')) {
		priority.alter = "";
	  } else {
		priority.alter = JSON.stringify(priority.alter);
	  }
	})

	// tweets
	rule.tweets = ruleJson.tweet;
	
	rule.actions = ruleJson.actions;
	rule.global_actions = ruleJson.global_actions;
	rule.global_actions_repeat = ruleJson.global_actions_repeat;

	// judgement
	rule.judgement = ruleJson.judgement;
	editorJudgement.getSession().setValue(rule.judgement);

	// calc
	rule.calc = ruleJson.calc;
	editorCalc.getSession().setValue(rule.calc);
  }

  /*****************************************************************************
   * ruleの保存
   * @memberOf rule
   */
  function saveRule() {
	var ruleJson = {};

	// headers
	ruleJson.headers = angular.copy(rule.headers);
	angular.forEach(ruleJson.headers, function(header) {
	  if (header.style == "null" || header.style == null) {
		delete header.style;
		delete header.value;
	  }
	});

	// items
	ruleJson.items = angular.copy(rule.items);
	angular.forEach(ruleJson.items, function(item) {
	  if (item.style == "null" || item.style == null) {
		delete item.style;
		delete item.value;
	  }
	  if (item.css == "" || item.css == null) {
		delete item.css;
	  }
	  if (item.prefix == "" || item.prefix == null) {
		delete item.prefix;
	  }
	  if (item.suffix == "" || item.suffix == null) {
		delete item.suffix;
	  }
	});

	// priority
	ruleJson.priority = angular.copy(rule.priorities);
	angular.forEach(ruleJson.priority, function(priority) {
	  if (priority.alter == "" || priority.alter == null) {
		delete priority.alter;
	  } else {
		try {
		  priority.alter = JSON.parse(priority.alter);
		} catch (e) {
		  delete priority.alter;
		}
	  }
	})

	// tweets
	ruleJson.tweet = angular.copy(rule.tweets);
	
	// judgement
	rule.judgement = editorJudgement.getSession().getValue();
	ruleJson.judgement = angular.copy(rule.judgement);

	// calc
	rule.calc = editorCalc.getSession().getValue();
	ruleJson.calc = angular.copy(rule.calc);

	console.log(JSON.stringify(ruleJson));

	/*
	 * fs.writeFile(boardJsonName, JSON.stringify(round.board), function(err) {
	 * if (err) { qeditor.alarm(err); } else { console.log(boardJsonName + 'is
	 * saved.'); successLog.push('board.json is saved.'); // board.html var
	 * tempHtml = fs.readFileSync("./template/temp-board.html", 'utf-8');
	 * tempHtml = tempHtml.replace(/\$\{css\}/g, round.board.css); tempHtml =
	 * tempHtml.replace(/\$\{rule\}/g, round.board.rule); tempHtml =
	 * tempHtml.replace(/\$\{title\}/g, round.board.title); tempHtml =
	 * tempHtml.replace(/\$\{status\}/g, round.board.status); if
	 * (round.board.victory) { tempHtml = tempHtml.replace(/\$\{victory\}/g, "<div
	 * victory></div>"); } else { tempHtml = tempHtml.replace(/\$\{victory\}/g,
	 * ""); } fs.writeFile(boardHtmlName, tempHtml, function(err) { if (err) {
	 * qeditor.alarm(err); } else { console.log(boardHtmlName + 'is saved.');
	 * successLog.push('board.html is saved.'); } }); } });
	 */

  }

  /*****************************************************************************
   * ruleを閉じる
   * @memberOf rule
   */
  function closeRule() {
	rule.name = null;
	rule.headers = null;
	rule.items = null;
	rule.priority = null;
	rule.tweet = null;
	rule.actions = null;
	rule.global_actions = null;
	rule.global_actions_repeat = null;
	rule.judgement = null;
	rule.calc = null;

  }

  /*****************************************************************************
   * headerの削除
   * @memberOf rule
   * @param {int} index 削除対象のindex
   */
  function deleteHeader(index) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  rule.headers.splice(index, 1);
	});
  }

  /*****************************************************************************
   * headerの追加
   * @memberOf rule
   */
  function addHeader() {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  rule.headers.push({
		key : result.inputString,
		value : 0,
		style : "number"
	  });
	});
  }

  /*****************************************************************************
   * itemの削除
   * @memberOf rule
   * @param {int} index 削除対象のindex
   */
  function deleteItem(index) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  rule.items.splice(index, 1);
	});
  }

  /*****************************************************************************
   * itemの追加
   * @memberOf rule
   */
  function addItem() {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  rule.items.push({
		key : result.inputString,
		value : 0,
		style : "number",
		css : ""
	  });
	});
  }

  /*****************************************************************************
   * priorityの削除
   * @memberOf rule
   * @param {int} index 削除対象のindex
   */
  function deletePriority(index) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  rule.priorities.splice(index, 1);
	});
  }

  /*****************************************************************************
   * priorityの追加
   * @memberOf rule
   */
  function addPriority() {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  rule.priorities.push({
		key : result.inputString,
		order : "desc",
		alter : ""
	  });
	});
  }

  /*****************************************************************************
   * tweetの削除
   * @memberOf rule
   * @param {int} index 削除対象のindex
   */
  function deleteTweet(key) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  delete rule.tweets[key];
	});
  }

  /*****************************************************************************
   * tweetの追加
   * @memberOf rule
   */
  function addTweet() {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  rule.tweets[result.inputString] = "";
	});
  }
  /*****************************************************************************
   * コード整形
   * @memberOf rule
   * @param {string} id - aceを適用しているdiv要素のid
   */
  function beautifyCode(id) {
	var session = editor[id].getSession();
	session.setValue(qeditor.beautify(session.getValue()));
  }

  /*****************************************************************************
   * コード追加
   * @memberOf rule
   * @param {string} id - aceを適用しているdiv要素のid
   * @param {string} str - 追加したい文字列（末尾の改行は不要）
   */
  function insertCode(id, str) {
	var session = editor[id].getSession();
	editor[id].insert(str + "\n");
  }

} ]);
