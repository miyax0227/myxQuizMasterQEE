/*******************************************************************************
 * ルールの読み込み・状態保持・保存を行うサービス
 * @class
 * @name rule
 */
app.service('rule', [ 'qeditor', function(qeditor) {
  const
  fs = require('fs');
  var ruleJsonName;
  var ruleJsName;

  // rule設定 ----------------------------------------------
  var rule = {};
  closeRule();

  rule.load = load;
  rule.saveRule = saveRule;
  rule.closeRule = closeRule;
  rule.isJson = qeditor.isJson;
  rule.deleteHeader = deleteHeader;
  rule.addHeader = addHeader;
  rule.deleteItem = deleteItem;
  rule.addItem = addItem;
  rule.deletePriority = deletePriority;
  rule.addPriority = addPriority;
  rule.deleteTweet = deleteTweet;
  rule.addTweet = addTweet;
  rule.deleteAction = deleteAction;
  rule.addAction = addAction;

  return rule;

  /*****************************************************************************
   * ruleの読み込み
   * @memberOf round
   * @param {string} name ラウンド名
   */
  function load(name) {
	rule.name = name;

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
	});

	// tweets
	rule.tweets = ruleJson.tweet;

	// actions
	rule.actions = ruleJson.actions;
	angular.forEach(rule.actions, function(action) {
	  if (!action.hasOwnProperty('keyArray')) {
		action.keyArray = "";
	  }
	  if (!action.hasOwnProperty('tweet')) {
		action.tweet = "";
	  }
	});

	// global_actions
	rule.global_actions = ruleJson.global_actions;
	angular.forEach(rule.global_actions, function(action) {
	  if (!action.hasOwnProperty('group')) {
		action.keyArray = "rule";
	  }
	  if (!action.hasOwnProperty('keyboard')) {
		action.keyArray = "";
	  }
	  if (!action.hasOwnProperty('tweet')) {
		action.tweet = "";
	  }
	});

	// global_actions_repeat
	rule.global_actions_repeat = ruleJson.global_actions_repeat;
	angular.forEach(rule.global_actions_repeat, function(action) {
	  if (!action.hasOwnProperty('group')) {
		action.keyArray = "rule";
	  }
	  if (!action.hasOwnProperty('tweet')) {
		action.tweet = "";
	  }
	});

	// judgement
	rule.judgement = ruleJson.judgement;

	// calc
	rule.calc = ruleJson.calc;
  }

  /*****************************************************************************
   * ruleの保存
   * @memberOf rule
   */
  function saveRule() {
	var ruleJson = {};
	var successLog = [];

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
	});

	// actions
	ruleJson.actions = angular.copy(rule.actions);
	angular.forEach(ruleJson.actions, function(action) {
	  if (action.keyArray == "" || action.keyArray == null) {
		delete action.keyArray;
	  }
	  if (action.tweet == "" || action.tweet == null) {
		delete action.tweet;
	  }
	})

	// global_actions
	ruleJson.global_actions = angular.copy(rule.global_actions);
	angular.forEach(ruleJson.global_actions, function(action) {
	  if (action.group == "" || action.group == null) {
		delete action.group;
	  }
	  if (action.keyboard == "" || action.keyboard == null) {
		delete action.keyboard;
	  }
	  if (action.tweet == "" || action.tweet == null) {
		delete action.tweet;
	  }
	})

	// global_actions_repeat
	ruleJson.global_actions_repeat = angular.copy(rule.global_actions_repeat);
	angular.forEach(ruleJson.global_actions_repeat, function(action) {
	  if (action.group == "" || action.group == null) {
		delete action.group;
	  }
	  if (action.tweet == "" || action.tweet == null) {
		delete action.tweet;
	  }
	})

	// tweets
	ruleJson.tweet = angular.copy(rule.tweets);

	// judgement
	ruleJson.judgement = angular.copy(rule.judgement);

	// calc
	ruleJson.calc = angular.copy(rule.calc);

	// console.log(JSON.stringify(ruleJson));

	// save to rule.json
	fs.writeFile(ruleJsonName, JSON.stringify(ruleJson), function(err) {
	  if (err) {
		qeditor.alarm(err);
	  } else {
		console.log(ruleJsonName + 'is	saved.');
		successLog.push('rule.json is saved.');

		// save to rule.js
		var tempJs = fs.readFileSync("./template/temp-rule", 'utf-8');

		// headers
		tempJs = tempJs.replace(/\$\{headers\}/g, JSON.stringify(ruleJson.headers, undefined, 2));

		// items, priority
		ruleJson.items.push({
		  key : "priority",
		  order : ruleJson.priority
		});
		tempJs = tempJs.replace(/\$\{items\}/g, JSON.stringify(ruleJson.items, undefined, 2));

		// tweets
		tempJs = tempJs.replace(/\$\{tweets\}/g, JSON.stringify(ruleJson.tweet, undefined, 2));

		// actions
		var tempActions = angular.copy(ruleJson.actions);
		angular.forEach(tempActions, function(action, index) {
		  action.enable0 = "${action" + index + "_enable0}";
		  action.action0 = "${action" + index + "_action0}";
		})

		var tempActionsJson = JSON.stringify(tempActions, undefined, 2);
		angular.forEach(ruleJson.actions, function(action, index) {
		  var enable0tag = "\"${action" + index + "_enable0}\"";
		  var enable0func = "function (player, players, header, property){\n";
		  enable0func = enable0func + action.enable0 + "\n}";
		  var action0tag = "\"${action" + index + "_action0}\"";
		  var action0func = "function (player, players, header, property){\n";
		  action0func = action0func + action.action0 + "\n}";

		  tempActionsJson = tempActionsJson.replace(enable0tag, enable0func);
		  tempActionsJson = tempActionsJson.replace(action0tag, action0func);
		});

		tempJs = tempJs.replace(/\$\{actions\}/g, tempActionsJson);

		// global_actions, global_actions_repeat
		var tempGlobalActions = angular.copy(ruleJson.global_actions);
		angular.forEach(tempGlobalActions, function(action, index) {
		  action.enable0 = "${action" + index + "_enable0}";
		  action.action0 = "${action" + index + "_action0}";
		})

		var tempGlobalActionsRepeat = angular.copy(ruleJson.global_actions_repeat);
		angular.forEach(tempGlobalActionsRepeat, function(action, index) {
		  action.indexes0 = "${action" + index + "_indexes0}";
		  action.enable1 = "${action" + index + "_enable1}";
		  action.action1 = "${action" + index + "_action1}";
		})

		tempGlobalActions = tempGlobalActions.concat(tempGlobalActionsRepeat);
		var tempGlobalActionsJson = JSON.stringify(tempGlobalActions, undefined, 2);

		angular.forEach(ruleJson.global_actions, function(action, index) {
		  var enable0tag = "\"${action" + index + "_enable0}\"";
		  var enable0func = "function (players, header, property){\n";
		  enable0func = enable0func + action.enable0 + "\n}";
		  var action0tag = "\"${action" + index + "_action0}\"";
		  var action0func = "function (players, header, property){\n";
		  action0func = action0func + action.action0 + "\n}";

		  tempGlobalActionsJson = tempGlobalActionsJson.replace(enable0tag, enable0func);
		  tempGlobalActionsJson = tempGlobalActionsJson.replace(action0tag, action0func);
		});

		angular.forEach(ruleJson.global_actions_repeat, function(action, index) {
		  var indexes0tag = "\"${action" + index + "_indexes0}\"";
		  var indexes0func = "function (players, header, property){\n";
		  indexes0func = indexes0func + action.indexes0 + "\n}";
		  var enable1tag = "\"${action" + index + "_enable1}\"";
		  var enable1func = "function (index, players, header, property){\n";
		  enable1func = enable1func + action.enable1 + "\n}";
		  var action1tag = "\"${action" + index + "_action1}\"";
		  var action1func = "function (index, players, header, property){\n";
		  action1func = action1func + action.action1 + "\n}";

		  tempGlobalActionsJson = tempGlobalActionsJson.replace(indexes0tag, indexes0func);
		  tempGlobalActionsJson = tempGlobalActionsJson.replace(enable1tag, enable1func);
		  tempGlobalActionsJson = tempGlobalActionsJson.replace(action1tag, action1func);
		});

		tempJs = tempJs.replace(/\$\{global_actions\}/g, tempGlobalActionsJson);

		// judgement
		tempJs = tempJs.replace(/\$\{judgement\}/g, ruleJson.judgement);

		// calc
		tempJs = tempJs.replace(/\$\{calc\}/g, ruleJson.calc);

		fs.writeFile(ruleJsName, tempJs, function(err) {
		  if (err) {
			qeditor.alarm(err);
		  } else {
			console.log(ruleJsName + 'is saved.');
			successLog.push('rule.js is saved.');
		  }
		});
	  }
	});

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
   * actionの削除
   * @memberOf rule
   * @param {object} actions 削除対象のactions(actions, globalActions,
   *            globalActionRepeat)
   * @param {int} key 削除対象のindex
   */
  function deleteAction(actions, key) {
	qeditor.confirm("削除してもよろしいですか?", function(result) {
	  actions.splice(key, 1);
	});
  }

  /*****************************************************************************
   * actionの追加
   * @memberOf rule
   * @param {object} actions 削除対象のactions(actions, globalActions,
   *            globalActionRepeat)
   */
  function addAction(actions) {
	qeditor.inputBox("追加するキーを入力してください。", function(result) {
	  actions.push({
		name : result.inputString
	  });
	});
  }

} ]);
