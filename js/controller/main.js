'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName, ["ngStorage", "ui.bootstrap", "ngAnimate", "ngResource", "ngSanitize"]);

/** クイズ画面用コントローラ */
app.controller('main', ['$scope', '$q', 'fileResource', 'qCommon', 'round',
	function ($scope, $q, fileResource, qCommon, round) {
		const fs = require('fs');

		/* Timer表示 */
		$scope.timerDisplay = "";
		/* Timerオブジェクト */
		$scope.timer = qCommon.timer;
		/* ボタン再押下可否 */
		$scope.pushable = true;
		/* 説明文のカウント取得 */
		$scope.getExplainCount = qCommon.getExplainCount;
		/* globalActionの表示有無 */
		$scope.globalActionVisible = true;
		/* 匿名状態 */
		$scope.anonymous = qCommon.anonymousMode();
		/* スクリーンショットを撮っている最中か */
		$scope.capturing = false;
		/* keyDownイベントのハンドラ */
		$scope.keyDown = function (event) {
			qCommon.keyDown($scope, event);
		};
		/* キー入力が有効か */
		$scope.workKeyDown = true;
		/* windowサイズの調整 */
		$scope.adjustWindow = function () {
			qCommon.adjustWindow($scope);
		};
		/* getPlayerCSS - プレイヤーの位置情報CSS */
		$scope.getPlayerCSS = qCommon.getPlayerCSS;
		/* getItemCSS - 伸縮が必要なアイテムのCSS */
		$scope.getItemCSS = qCommon.getItemCSS;
		/* getRankColorCSS - 値により背景色が変わるアイテムのCSS */
		$scope.getRankColorCSS = qCommon.getRankColorCSS;
		/* viewMode - 表示モードの判定 */
		$scope.viewMode = qCommon.viewMode();
		/* addPlayer - プレイヤー追加 */
		$scope.addPlayer = function (index) {
			qCommon.addPlayer(index, $scope);
		};
		/* removePlayer - プレイヤー削除 */
		$scope.removePlayer = function (index) {
			qCommon.removePlayer(index, $scope);
		};
		/* historyChanged - 特定の履歴を現在の状態に反映する */
		$scope.historyChanged = function (index) {
			qCommon.refreshCurrent(history[index], $scope);
		};
		/* mergeItemCSS - CSSをマージして返却する */
		$scope.mergeItemCSS = qCommon.mergeItemCSS;
		/* calc - 再計算関数 */
		$scope.calc = function () {
			var players = $scope.current.players;
			var header = $scope.current.header;
			var items = $scope.items;
			var property = $scope.property;
			round.calc(players, header, items, property);
		};
		/* getDisplayValue - 表示用の値の取得 */
		$scope.getDisplayValue = qCommon.getDisplayValue;
		/* changePlayer - プレイヤー変更用のモーダルウィンドウを表示する */
		$scope.changePlayer = function (player, items) {
			qCommon.changePlayer($scope, player, items);
		};
		/* decoration - 装飾用クラスリストを取得する */
		$scope.decoration = round.decoration;

		/* 読み込み対象のファイルを全て読み込み終えたら実行される処理（事実上のメイン処理）*/
		$q.all(fileResource.map(function (resource) {
			return resource.query().$promise;
		})).then(function (strs) {
			// 初期アニメーション停止
			$scope.initialAnimation = false;
			// nameList
			$scope.nameList = strs[3];
			// keyboard入力の定義
			$scope.keyArray = strs[5][0];
			$scope.keyCode = strs[5][1];
			// windowサイズ
			$scope.windowSize = strs[4][0];
			qCommon.resizeWindow($scope);
			qCommon.adjustWindow($scope);
			// 画面キャプチャ用windowのサイズ
			$scope.captureWindowSize = strs[4][4];
			// プロパティ
			$scope.property = strs[1][0];
			angular.forEach(strs[6][0], function (value, key) {
				if (!$scope.property.hasOwnProperty(key)) {
					$scope.property[key] = value;
				}
			});
			// 説明文
			if (!angular.isUndefined(strs[1][2])) {
				$scope.explain = [];
				angular.forEach(strs[1][2], function (e) {
					$scope.explain.push(e);
				})
			} else {
				$scope.explain = [];
			}
			// プレイヤー表示座標設定
			$scope.lineProperty = strs[6][1];
			angular.forEach(round.lines, function (value, key) {
				$scope.lineProperty[key] = value;
			});
			// tweetのひな型
			$scope.property.tweet = {};
			$scope.property.tweet = strs[7][0];
			round.setTweet($scope.property.tweet);
			// 選択中のプレイヤーの初期化
			$scope.selectPlayer = {};
			// items生成
			$scope.items = strs[2];
			// rule内に独自定義されたitemを追加
			Array.prototype.push.apply($scope.items, round.items);
			// defaultHeader生成
			$scope.defaultHeader = strs[0];
			// rule内に独自定義されたheaderを追加
			Array.prototype.push.apply($scope.defaultHeader, round.head);
			// localStorageとbind
			qCommon.saveToStorage($scope, qCommon.viewMode());
			// 操作ウィンドウ側の場合、localStorageに格納されていた値とは関係なく初期化
			if (!qCommon.viewMode()) {
				var initCurrent = {};
				// 履歴ファイルの存在確認
				try {
					// ファイルが存在する場合
					initCurrent = JSON.parse(fs.readFileSync(qCommon.getHistoryFileName(), 'utf-8'));
					qCommon.refreshCurrent(initCurrent, $scope);
				} catch (e) {
					// ファイルが存在しない場合
					// ヘッダ部分の初期化
					initCurrent.header = qCommon.getDefaultHeader($scope.defaultHeader);
					// tweetsリストを追加
					initCurrent.header.tweets = [];
					// プレイヤー部分の初期化
					var entryFileName = qCommon.getEntryFileName();
					var entryPlayers;
					try {
						entryPlayers = JSON.parse(fs.readFileSync(entryFileName, 'utf-8'));
					} catch (e) {
						entryPlayers = strs[1][1];
					}
					initCurrent.players = qCommon.initPlayers(entryPlayers, $scope.items);
					qCommon.refreshCurrent(initCurrent, $scope);
				}

				// タイマー
				$scope.timer['defaultTime'] = $scope.property.timer;
				$scope.timer['working'] = false;
				$scope.timer['visible'] = false;
				$scope.timer['destination'] = null;
				$scope.timer['restTime'] = null;
				qCommon.timer = $scope.timer;

				// 説明文
				qCommon.setExplainCount($scope.explain.length);

			}
			// 履歴
			$scope.history = [];
			// redo用の履歴
			$scope.redoHistory = [];
			/* action - playerに紐づく操作 */
			$scope.actions = round.actions;
			/* global_action - 全体的な操作 */
			$scope.global_actions = round.global_actions;
			/* 関数のラッピング(player範囲) */
			$scope.func_player_scope = function (func, player) {
				return func(player, $scope);
			};
			/* 関数のラッピング(全体) */
			$scope.func_scope = function (func) {
				return func($scope);
			};
			/* 関数のラッピング（繰り返し） */
			$scope.func_index_scope = function (func, index) {
				return func(index, $scope);
			};
			// 従属変数の再計算
			$scope.calc();
			// 優勝者が決定している場合、優勝者名の設定
			$scope.victoryName = function () {
				return qCommon.victoryName($scope);
			};
			// 履歴が無い場合、現在の得点状況を追加
			if ($scope.history.length == 0) {
				qCommon.createHist($scope);
			}
			// タイマースタート
			qCommon.timerTimerStart($scope);

			// 初期アニメーションスタート
			// $scope.initialAnimation = true;
		});
	}]);

app.controller('modal', ['$scope', 'qCommon', '$uibModalInstance',
	function ($scope, qCommon, $uibModalInstance) {
		/* filterPlayer - プレイヤー検索用関数 */
		$scope.filterPlayer = qCommon.filterPlayer;
		/* setPlayer - プレイヤー選択 */
		$scope.setPlayer = qCommon.setPlayer;
		/* clearPlayer - プレイヤー情報削除 */
		$scope.clearPlayer = qCommon.clearPlayer;
		/* sortPlayer - プレイヤー並び替え */
		$scope.sortPlayer = qCommon.sortPlayer;
		/* naturalNumberList - 自然数リスト生成 */
		$scope.naturalNumberList = function (n) {
			var arr = Array.from(Array(n + 1).keys());
			arr.shift();
			return arr;
		};

    /** プレイヤーを再下段へ移動する
     * @param {number} index 対象プレイヤーのindex
     * @param {object} items 並び替え対象チームのitem
     */
		$scope.moveDown = function moveDown(index, items) {
			angular.forEach(items, function (item) {
				if (item.repeat) {
					for (var i = index; i <= item.repeat[1] - 1; i++) {
						swapKey(item.repeat[0] + (i), item.repeat[0] + (i + 1));
					}
				}
			});
		};

    /** キーを入替する
     * @param {string} key1 入替するキー1
     * @param {string} key2 入替するキー2
     */
		function swapKey(key1, key2) {
			var swap = $scope.selectPlayer[key2];
			$scope.selectPlayer[key2] = $scope.selectPlayer[key1];
			$scope.selectPlayer[key1] = swap;
		}

		/* modalOK - OKボタン押下 */
		$scope.modalOK = function () {
			$uibModalInstance.close();
		};

		/* modalCancel - Cancelボタン押下 */
		$scope.modalCancel = function () {
			$uibModalInstance.dismiss();
		};

	}]);

/** 全てのjsonファイルの読込の同期をとるためのfactory */
app.factory('fileResource', function ($resource) {
	// 読み込むjsonファイルを列挙
	return [
		// header.json - 履歴情報のうち、playerに依らない全体的な情報の定義
		$resource('../../json/header.json')
		// property.json - クイズのルールの中で、可変な値の設定(ラウンド毎に設定)
		, $resource('./property.json')
		// item.json - プレイヤーの属性の定義
		, $resource('../../json/item.json')
		// name.json - 名前・初期値の定義
		, $resource('../../history/current/nameList.json')
		// window.json - ウィンドウサイズの定義
		, $resource('../../json/window.json')
		// keyboard.json - キーボード入力の定義
		, $resource('../../json/keyboard.json')
		// property.json - クイズのルールの中で、可変な値の設定(共通、ラウンド毎に設定がないプロパティを補完)
		, $resource('../../json/property.json')
		// tweet.json - ツイートの雛型
		, $resource('../../json/tweet.json')];
});

/** ローカルプロバイダの設定 */
app.config(["$locationProvider", function ($locationProvider) {
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: false
	});
}]);

/** ディレクティブ */
app.directive('players', function () {
	return {
		restrict: 'A',
		transclude: true,
		templateUrl: '../../template/players.html'
	};
});

app.directive('globalActions', function () {
	return {
		restrict: 'A',
		transclude: false,
		templateUrl: '../../template/global_actions.html'
	};
});

app.directive('timerActions', function () {
	return {
		restrict: 'A',
		transclude: false,
		templateUrl: '../../template/timer_actions.html'
	};
});

app.directive('scoreboard', function () {
	return {
		restrict: 'A',
		transclude: true,
		templateUrl: '../../template/scoreboard.html'
	};
});

app.directive('victory', function () {
	return {
		restrict: 'A',
		transclude: true,
		templateUrl: '../../template/victory.html'
	};
});

app.directive('profile', function () {
	return {
		restrict: 'A',
		transclude: true,
		templateUrl: '../../template/profile.html'
	};
});

app.directive('explain', function () {
	return {
		restrict: 'A',
		transclude: true,
		templateUrl: '../../template/explain.html'
	};
});

/** フィルタ */
app.filter('with', function () {
	return function (array, key) {
		return array.filter(function (one) {
			return one.hasOwnProperty(key);
		});
	};
});

app.filter('group', function () {
	return function (array, key) {
		if (array == null || array == undefined)
			return null;
		return array.filter(function (one) {
			return one.hasOwnProperty('group') && one.group == key;
		});
	};
});
