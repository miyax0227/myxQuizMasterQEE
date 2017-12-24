var appName = "myxQuizEditor";
var app = angular.module(appName, [ "ui.bootstrap", "ngAnimate", "ui.sortable", "ui.ace",
	"angular-clipboard" ]);

/*******************************************************************************
 * メインコントローラ
 * @class
 * @name main
 */
app.controller('main', [ '$scope', 'qeditor', '$interval', 'round', 'rule', 'css',
	function($scope, qeditor, $interval, round, rule, css) {
	  const
	  fs = require('fs');

	  $scope.rounds = [];
	  $scope.csses = [];
	  $scope.rules = [];
	  $scope.styles = [ "number", "string", "boolean", "null" ];
	  $scope.orders = [ "desc", "asc" ];
	  $scope.editing = false;
	  refresh();

	  $scope.refresh = refresh;
	  $scope.openRound = openRound;
	  $scope.copyRound = copyRound;
	  $scope.deleteRound = deleteRound;
	  $scope.openRule = openRule;
	  $scope.copyRule = copyRule;
	  $scope.deleteRule = deleteRule;
	  $scope.openCss = openCss;
	  $scope.copyCss = copyCss;
	  $scope.deleteCss = deleteCss;
	  $scope.aceLoaded = aceLoaded;

	  /*************************************************************************
	   * ファイルリストをリフレッシュする
	   * @memberOf main
	   */
	  function refresh() {
		$scope.rounds = qeditor.getFileList(__dirname + '/round', false);
		$scope.csses = qeditor.getFileList(__dirname + '/json/css', true, 'json');
		$scope.rules = qeditor.getFileList(__dirname + '/json/rule', true, 'json');
	  }

	  /*************************************************************************
	   * すべて閉じる
	   * @memberOf main
	   */
	  function closeAll() {
		round.closeRound();
		rule.closeRule();
		css.closeCss();
	  }

	  /*************************************************************************
	   * ラウンドを開く
	   * @memberOf main
	   */
	  function openRound(name) {
		closeAll();
		round.load(name);
	  }

	  /*************************************************************************
	   * ラウンドをコピーする
	   * @memberOf main
	   */
	  function copyRound(name) {
		var oldRound = __dirname + '/round/' + name;
		var newRound = "";

		qeditor.inputBox("新しいラウンドの名前を入力してください。", function(result) {
		  newRound = __dirname + '/round/' + result.inputString;

		  fs.mkdirSync(newRound);
		  qeditor.copyFile(oldRound + '/board.json', newRound + '/board.json');
		  qeditor.copyFile(oldRound + '/board.html', newRound + '/board.html');
		  qeditor.copyFile(oldRound + '/entry.json', newRound + '/entry.json');
		  qeditor.copyFile(oldRound + '/property.json', newRound + '/property.json');

		  // ファイルリストを読み込み直す
		  refresh();
		});
	  }

	  /*************************************************************************
	   * ラウンドを削除する
	   * @memberOf main
	   */
	  function deleteRound(name) {
		var oldRound = __dirname + '/round/' + name;

		qeditor.confirm("ラウンド" + name + "を削除します。\nよろしいですか？", function() {

		  // ファイルを削除
		  var targetRemoveFiles = fs.readdirSync(oldRound);
		  for ( var file in targetRemoveFiles) {
			fs.unlinkSync(oldRound + "/" + targetRemoveFiles[file]);
		  }
		  // フォルダを削除
		  fs.rmdirSync(oldRound);

		  // ファイルリストを読み込み直す
		  refresh();
		});
	  }

	  /*************************************************************************
	   * ルールを開く
	   * @memberOf main
	   */
	  function openRule(name) {
		closeAll();
		rule.load(name);
	  }

	  /*************************************************************************
	   * ルールをコピーする
	   * @memberOf main
	   */
	  function copyRule(name) {
		var oldRuleJs = __dirname + '/js/rule/' + name + '.js';
		var oldRuleJson = __dirname + '/json/rule/' + name + '.json';

		qeditor.inputBox("新しいルールの名前を入力してください。", function(result) {
		  var newRuleJs = __dirname + '/js/rule/' + result.inputString + '.js';
		  var newRuleJson = __dirname + '/json/rule/' + result.inputString + '.json';

		  qeditor.copyFile(oldRuleJs, newRuleJs);
		  qeditor.copyFile(oldRuleJson, newRuleJson);

		  // ファイルリストを読み込み直す
		  refresh();

		});
	  }

	  /*************************************************************************
	   * ルールを削除する
	   * @memberOf main
	   */
	  function deleteRule(name) {
		var oldRuleJs = __dirname + '/js/rule/' + name + '.js';
		var oldRuleJson = __dirname + '/json/rule/' + name + '.json';

		qeditor.confirm("ルール" + name + "を削除します。\nよろしいですか？", function() {
		  // ファイル削除
		  fs.unlinkSync(oldRuleJs);
		  fs.unlinkSync(oldRuleJson);

		  // ファイルリストを読み込み直す
		  refresh();

		});
	  }

	  /*************************************************************************
	   * CSSを開く
	   * @memberOf main
	   */
	  function openCss(name) {
		closeAll();
		css.load(name);
	  }

	  /*************************************************************************
	   * CSSをコピーする
	   * @memberOf main
	   */
	  function copyCss(name) {
		// TODO: 
	  }
	  
	  /*************************************************************************
	   * CSSを削除する
	   * @memberOf main
	   */
	  function deleteCss(name) {
		// TODO:
	  }
	  
	  /*************************************************************************
	   * aceエディタ起動処理
	   */
	  function aceLoaded(_editor) {
		console.log("aceLoaded!");
		_editor.commands.addCommand({
		  Name : "beautify",
		  bindKey : {
			win : "Ctrl-Shift-F",
			mac : "Ctrl-Shift-F"
		  },
		  exec : function(editor) {
			var session = editor.getSession();
			session.setValue(qeditor.beautify(session.getValue()));
		  }
		});

		_editor.on("focus", function() {
		  $scope.focusedEditor = _editor;
		  console.log("aceFocused!");
		});
	  }

	} ]);

/*******************************************************************************
 * ラウンド編集用のコントローラ
 * @class
 * @name roundCtrl
 */
app.controller('roundCtrl', [ '$scope', 'round', function($scope, round) {
  $scope.round = round;
} ]);

/*******************************************************************************
 * ルール編集用のコントローラ
 * @class
 * @name ruleCtrl
 */
app.controller('ruleCtrl', [ '$scope', 'rule', function($scope, rule) {
  $scope.rule = rule;
} ]);

/*******************************************************************************
 * CSS編集用のコントローラ
 * @class
 * @name cssCtrl
 */
app.controller('cssCtrl', [ '$scope', 'css', function($scope, css) {
  $scope.css = css;
} ]);

/*******************************************************************************
 * モーダルウィンドウのコントローラ
 * @class
 * @name modal
 */
app.controller('modal', [ '$scope', '$uibModalInstance', 'myMsg',
	function($scope, $uibModalInstance, myMsg) {
	  // メッセージ表示
	  $scope.msg = myMsg.msg;
	  $scope.isArray = myMsg.isArray;

	  $scope.input = {};
	  $scope.input.inputString = "";

	  /* modalOK - OKボタン押下 */
	  $scope.modalOK = function() {
		$uibModalInstance.close($scope.input);
	  }

	  /* modalCancel - Cancelボタン押下 */
	  $scope.modalCancel = function() {
		$uibModalInstance.dismiss($scope.input);
	  }
	} ]);

/*******************************************************************************
 * ディレクティブ
 */
app.directive('editorRoundBoard', function() {
  return {
	templateUrl : './template/editor-round-board.html'
  }
});

app.directive('editorRoundEntry', function() {
  return {
	templateUrl : './template/editor-round-entry.html'
  }
});

app.directive('editorRoundProperty', function() {
  return {
	templateUrl : './template/editor-round-property.html'
  }
});

app.directive('editorRuleHeader', function() {
  return {
	templateUrl : './template/editor-rule-header.html'
  }
});

app.directive('editorRuleItems', function() {
  return {
	templateUrl : './template/editor-rule-items.html'
  }
});

app.directive('editorRulePriority', function() {
  return {
	templateUrl : './template/editor-rule-priority.html'
  }
});

app.directive('editorRuleTweet', function() {
  return {
	templateUrl : './template/editor-rule-tweet.html'
  }
});

app.directive('editorRuleActions', function() {
  return {
	templateUrl : './template/editor-rule-actions.html'
  }
});

app.directive('editorRuleJudgement', function() {
  return {
	templateUrl : './template/editor-rule-judgement.html'
  }
});

app.directive('editorRuleCalc', function() {
  return {
	templateUrl : './template/editor-rule-calc.html'
  }
});

app.directive('editorCssIncludes', function() {
  return {
	templateUrl : './template/editor-css-includes.html'
  }
});

app.directive('editorCssVariables', function() {
  return {
	templateUrl : './template/editor-css-variables.html'
  }
});

app.directive('editorCssLines', function() {
  return {
	templateUrl : './template/editor-css-lines.html'
  }
});

app.directive('editorCssItems', function() {
  return {
	templateUrl : './template/editor-css-items.html'
  }
});

app.directive('editorCssImages', function() {
  return {
	templateUrl : './template/editor-css-images.html'
  }
});

app.directive('editorCssButtons', function() {
  return {
	templateUrl : './template/editor-css-buttons.html'
  }
});

app.directive('uiClipboard', function() {
  return {
	templateUrl : './template/clipboard.html',
	scope : {
	  "words" : "="
	}
  }
});