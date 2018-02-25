'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * round - ラウンド特有のクイズのルール・画面操作の設定
 ******************************************************************************/
app.factory('round', ['qCommon', 'rule', '$filter',
	function (qCommon, rule, $filter) {

		var round = {};
		var win = qCommon.win;
		var lose = qCommon.lose;
		var victory = qCommon.victory;
		var timer = qCommon.timer;

		round.calc = calc;
		round.actions = rule.actions;
		round.global_actions = rule.global_actions;
		round.items = rule.items;
		round.head = rule.head;
		round.decoration = decoration;
		round.lines = rule.lines;

		/*****************************************************************************
		 * 判定関数
		 * 
		 * @memberOf round
		 * @param {array} players - プレイヤー情報リスト
		 * @param {array} items - アイテム情報リスト
		 * @param {object} property - プロパティ情報
		 ****************************************************************************/
		function judgement(players, header, property) {
			return rule.judgement(players, header, property);
		}

		/*****************************************************************************
		 * 再計算関数
		 * 
		 * @memberOf round
		 * @param {array} players - プレイヤー情報リスト
		 * @param {object} header - ヘッダ情報
		 * @param {array} items - アイテム情報リスト
		 * @param {object} property - プロパティ情報
		 ****************************************************************************/
		function calc(players, header, items, property) {
			// ハンドルネームの設定が無い場合は氏名をコピーする
			angular.forEach(players, function (player) {
				if (!player.hasOwnProperty('handleName')) {
					player.handleName = player.name;
				}
			});

			// 優先順位の計算
			angular.forEach(items.filter(function (item) {
				return item.hasOwnProperty('order');
			}), function (record, i) {
				var calcPlayers = [];
				angular.forEach(players, function (player, i) {
					calcPlayers.push(player);
				});
				calcPlayers.sort(qCommon.playerSortOn(record.order, true, players)).map(function (player, i) {
					player[record.key] = i;
				});
			});

			// ターンオーバー対象の計算
			if (!property.hasOwnProperty('openRankArray') || property.openRankArray == null) {
				header.openRank = -1;
			}

			// openRankが-1の場合、全てオープン
			if (header.openRank < 0) {
				angular.forEach(players, function (player) {
					if (player.close) {
						player.close = false;
					}
				});

				// openRankが0以上の場合、openRank以下のpaperRankを持つプレイヤーをopen
			} else {
				angular.forEach(players, function (player) {
					if (player.close && player.paperRank <= header.openRank) {
						player.close = false;
					}
				});

			}

			// 個別のルールに記載された再計算関数を実行
			rule.calc(players, header, items, property);

		}

		/*****************************************************************************
		 * 装飾用クラスの判定・返却
		 * 
		 * @memberOf round
		 * @param {array} player - プレイヤー情報
		 * @param {array} item - アイテム情報
		 * @return {array} - 装飾用クラスのリスト
		 ****************************************************************************/
		function decoration(player, item) {
			var deco = [];
			angular.forEach(rule.decor, function (d) {
				if (player[d] && item[d]) {
					deco.push(d);
				}
			});
			return deco;
		}

		/*****************************************************************************
		 * actions - プレイヤー毎に設定する操作の設定
		 ****************************************************************************/
		Array.prototype.push.apply(round.actions, [
			/*****************************************************************************
			 * 強制勝抜(プレーオフ時)
			 ****************************************************************************/
			{
				name: "",
				css: "action_win",
				button_css: "btn btn-primary btn-sm",
				enable0: function (player, players, header) {
					return (["normal", "wait", "absent"].indexOf(player.status) >= 0 && header.playoff);
				},
				action0: function (player, players, header, property) {
					qCommon.win(player, players, header, property);
					header.qCount++;
				}
			},
			/*****************************************************************************
			 * 強制失格(プレーオフ時)
			 ****************************************************************************/
			{
				name: "",
				css: "action_lose",
				button_css: "btn btn-danger btn_sm",
				enable0: function (player, players, header) {
					return (["normal", "wait", "absent"].indexOf(player.status) >= 0 && header.playoff);
				},
				action0: function (player, players, header, property) {
					lose(player, players, header, property);
					header.qCount++;
				}
			},
			/*****************************************************************************
			 * 強制待機(プレーオフ時)
			 ****************************************************************************/
			{
				name: "",
				css: "action_wait",
				button_css: "btn btn-warning btn_sm",
				enable0: function (player, players, header) {
					return (["normal", "wait", "absent"].indexOf(player.status) >= 0 && header.playoff);
				},
				action0: function (player, players, header) {
					player.status = "wait";
					header.qCount++;
				}
			}]);

		/*****************************************************************************
		 * global_actions - 全体に対する操作の設定
		 ****************************************************************************/
		Array.prototype.push.apply(round.global_actions, [
			/*****************************************************************************
			 * 表示
			 ****************************************************************************/
			{
				name: "view",
				button_css: "btn btn-primary",
				group: "basic",
				enable: function (scope) {
					return true;
				},
				action: function (scope) {
					qCommon.openWindow(scope.windowSize);
				}
			},
			/*****************************************************************************
			 * 編集
			 ****************************************************************************/
			{
				name: "edit",
				button_css: "btn btn-primary",
				group: "basic",
				enable: function (scope) {
					return true;
				},
				action: function (scope) {
					qCommon.editCurrent(scope);
				}
			},
			/*****************************************************************************
			 * スクリーンショット
			 ****************************************************************************/
			{
				name: "ss",
				button_css: "btn btn-primary",
				group: "basic",
				keyboard: "Esc",
				enable: function (scope) {
					return !scope.capturing;
				},
				action: function (scope) {
					// キャプチャ中
					scope.capturing = true;

					var fs;
					var BrowserWindow;
					try {
						fs = require('fs');
						BrowserWindow = require('electron').remote.BrowserWindow;

						// キャプチャ用ウィンドウを生成
						var win = null;
						win = new BrowserWindow({
							width: scope.captureWindowSize.width,
							height: scope.captureWindowSize.height,
							y: scope.captureWindowSize.top,
							x: scope.captureWindowSize.left,
							title: "Capture"
						});
						win.loadURL('file://' + __dirname + '/board.html?view=true&anonymous=true');
						// キャプチャ用ウィンドウの立ち上げ終了時にイベントを検知する
						win.webContents.on('did-finish-load', captureFunc);

						function dateString() {
							return $filter('date')(new Date(), 'yyyyMMddHHmmss.sss');
						}

						function captureFunc() {
							// 立ち上げ終了から5秒後に動作
							setTimeout(function () {
								// キャプチャ実行
								win.capturePage(function (img) {
									// png形式で保存
									fs.writeFile(__dirname + "/../../twitter/" + dateString() + ".png", img.toPng(), function (err) {
										if (err) {
											console.log(err);
										}
									});
									// キャプチャ用ウィンドウを閉じる
									win.close();
									// キャプチャ終了
									scope.capturing = false;
								});
							}, 5000);
						}
					} catch (e) {
						console.log('fs is not supported.');
					}
				}
			},
			/*****************************************************************************
			 * アンドゥ
			 ****************************************************************************/
			{
				name: "undo",
				button_css: "btn btn-danger",
				group: "history",
				keyboard: "Left",
				enable: function (scope) {
					return (scope.history.length >= 2);
				},
				action: function (scope) {
					if (scope.history.length > 0) {
						// redo用の配列に現在の状態を退避
						scope.redoHistory.push(angular.copy(scope.history.pop()));
						// 履歴から最新の状態を取得
						var hist = scope.history[scope.history.length - 1];
						// 状態を更新
						qCommon.refreshCurrent(hist, scope);
					}
				}
			},
			/*****************************************************************************
			 * リドゥ
			 ****************************************************************************/
			{
				name: "redo",
				button_css: "btn btn-danger",
				group: "history",
				keyboard: "Right",
				enable: function (scope) {
					return (scope.redoHistory.length > 0);
				},
				action: function (scope) {
					if (scope.redoHistory.length > 0) {
						// redo用の配列から最新の状態を取得
						var hist = scope.redoHistory.pop();
						// 状態を更新
						qCommon.refreshCurrent(hist, scope);
						// 履歴に現在の状態を退避
						scope.history.push(angular.copy(scope.current));
						scope.currentPage = scope.history.length;
					}
				}
			},
			/*****************************************************************************
			 * 1秒＋
			 ****************************************************************************/
			{
				name: "+",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return (qCommon.timer.destination == null);
				},
				action: function (scope) {
					qCommon.timerPlus1();
				}
			},
			/*****************************************************************************
			 * 1秒－
			 ****************************************************************************/
			{
				name: "-",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return (qCommon.timer.destination == null);
				},
				action: function (scope) {
					qCommon.timerMinus1();
				}
			},
			/*****************************************************************************
			 * タイマースタート/リセット
			 ****************************************************************************/
			{
				name: "start/reset",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return (qCommon.timer.destination == null);
				},
				action: function (scope) {
					if (qCommon.timer.working) {
						qCommon.timerReset();
					} else {
						qCommon.timerStart();
					}
				}
			},
			/*****************************************************************************
			 * タイマーストップ/リスタート
			 ****************************************************************************/
			{
				name: "stop/restart",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return qCommon.timer.working;
				},
				action: function (scope) {
					if (qCommon.timer.restTime == null) {
						qCommon.timerStop();
					} else {
						qCommon.timerRestart();
					}
				}
			},
			/*****************************************************************************
			 * タイマー表示/非表示
			 ****************************************************************************/
			{
				name: "show/hide",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return true;
				},
				action: function (scope) {
					if (qCommon.timer.visible) {
						qCommon.timerHide();
					} else {
						qCommon.timerShow();
					}
				}
			},
			/*****************************************************************************
			 * 説明文送る
			 ****************************************************************************/
			{
				name: "exp",
				button_css: "btn btn-success",
				group: "timer",
				enable: function (scope) {
					return true;
				},
				action: function (scope) {
					qCommon.explainNext();
				}
			},
			/*****************************************************************************
			 * global_action表示/非表示
			 ****************************************************************************/
			{
				name: "x",
				button_css: "btn btn-info",
				group: "view",
				keyboard: "S+Left",
				enable: function (scope) {
					return true;
				},
				action: function (scope) {
					scope.globalActionVisible = !scope.globalActionVisible;
				}
			},
			/*****************************************************************************
			 * 優勝者名の表示/非表示
			 ****************************************************************************/
			{
				name: "award",
				button_css: "btn btn-info",
				group: "view",
				enable: function (scope) {
					return scope.victoryName() != null;
				},
				action0: function (players, header) {
					header.victoryNameVisible = !header.victoryNameVisible;
				}
			},
			/*****************************************************************************
			 * 順位表示
			 ****************************************************************************/
			{
				name: "open",
				button_css: "btn btn-info",
				group: "view",
				keyboard: "S+Right",
				enable0: function (players, header) {
					return header.openRank >= 0;
				},
				action0: function (players, header, property) {
					if (players.filter(function (player) {
						return player.close;
					}).length == 0) {
						header.openRank = -1;
					} else {
						// クローズ状態のプレイヤーの最小順位
						var closeRank = Math.min.apply(null, players.filter(function (player) {
							return player.close;
						}).map(function (player) {
							return player.paperRank;
						}));

						// クローズ状態のプレイヤーの最小順位が開くための最小閾値
						var openRank = Math.min.apply(null, property.openRankArray.filter(function (rank) {
							return rank >= closeRank;
						}));

						// openRankが0以上の値の場合
						if (openRank >= 0 && openRank < Infinity) {
							header.openRank = openRank;
						} else {
							header.openRank = -1;
						}
					}

				}
			},
			/*****************************************************************************
			 * プレーオフ終了
			 ****************************************************************************/
			{
				name: "regular",
				button_css: "btn btn-warning",
				group: "playoff",
				enable0: function (players, header) {
					return (header.playoff);
				},
				action0: function (players, header, property) {
					qCommon.playoffoff(players, header);
				}
			},
			/*****************************************************************************
			 * プレーオフ開始
			 ****************************************************************************/
			{
				name: "playoff",
				button_css: "btn btn-warning",
				group: "playoff",
				enable0: function (players, header) {
					return (!header.playoff);
				},
				action0: function (players, header, property) {
					header.playoff = true;
				}
			},
			/*****************************************************************************
			 * 上位判定
			 ****************************************************************************/
			{
				name: "upper",
				button_css: "btn btn-warning",
				group: "playoff",
				keyboard: "S+Up",
				enable0: function (players, header) {
					return true;
				},
				action: function (scope) {
					var header = scope.current.header;
					var players = scope.current.players;
					var property = scope.property;

					// 現在プレーオフモードの場合
					if (header.playoff) {

						// 通常状態のプレイヤーは全員勝ち抜け
						players.filter(function (player) {
							return (["normal"].indexOf(player.status) >= 0);
						}).map(function (player) {
							win(player, players, header, property);
						});

						// プレーオフ終了
						qCommon.playoffoff(players, header);

					} else {
						// 優先順位のキー項目名
						var priority = "priority";

						// ボーダー上のプレイヤーリスト
						var borderPlayers = [];

						// ボーダー上のプレイヤーの優先順位キー
						var keyPriority = Math.min.apply(null, players.filter(function (player) {
							var statusBool = (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							var lotBool = (!header.hasOwnProperty("nowLot")) || (header.nowLot == player.lot);
							return statusBool && lotBool;
						}).map(function (player) {
							return player[priority];
						}));

						// 優先順位を取得できない場合は上位判定しない
						if (keyPriority === null) {
							return;
						}

						// ボーダー上のプレイヤーを取得（この時点ではボーダー上のプレイヤーは一人とは限らない）
						var keyPriorityPlayer = players.filter(function (player) {
							return (player[priority] == keyPriority);
						})[0];

						// ボーダー上のプレイヤーと比較同位のプレイヤーリストを取得
						borderPlayers = players.filter(function (player) {
							var statusBool = (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							var lotBool = (!header.hasOwnProperty("nowLot")) || (header.nowLot == player.lot);
							return statusBool && lotBool;
						}).filter(function (player) {
							return (qCommon.playerSortOn(scope.items.filter(function (item) {
								return (item.key == priority);
							})[0].order, false, scope)(keyPriorityPlayer, player) == 0);
						});

						// ボーダー上のプレイヤーが一人だけの場合
						if (borderPlayers.length == 1) {
							// そのプレイヤーは勝ち抜け
							win(borderPlayers[0], players, header, property);

							// ボーダー上のプレイヤーが二人以上の場合
						} else if (borderPlayers.length >= 2) {

							// ボーダー上にいないプレイヤーを待機状態にする
							players.filter(function (player) {
								return (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							}).map(function (player) {
								if (borderPlayers.indexOf(player) < 0) {
									player.status = "wait";
								}
							});

							// プレーオフスタート
							header.playoff = true;
						}
					}
					// 再計算
					calc(scope.current.players, scope.current.header, scope.items, scope.property);
					// 履歴作成
					qCommon.createHist(scope);

				}
			},
			/*****************************************************************************
			 * 下位判定
			 ****************************************************************************/
			{
				name: "lower",
				button_css: "btn btn-warning",
				group: "playoff",
				keyboard: "S+Down",
				enable0: function (players, header) {
					return true;
				},
				action: function (scope) {
					var header = scope.current.header;
					var players = scope.current.players;
					var property = scope.property;

					// 現在プレーオフモードの場合
					if (header.playoff) {

						// 通常状態のプレイヤーは全員失格(逆順に)
						var losePlayers = players.filter(function (player) {
							return (["normal"].indexOf(player.status) >= 0);
						});
						losePlayers.reverse();
						losePlayers.map(function (player) {
							lose(player, players, header, property);
						});

						// プレーオフ終了
						qCommon.playoffoff(scope.current.players, scope.current.header);

					} else {
						// 優先順位のキー項目名
						var priority = "priority";

						// ボーダー上のプレイヤーリスト
						var borderPlayers = [];

						// ボーダー上のプレイヤーの優先順位キー
						var keyPriority = Math.max.apply(null, players.filter(function (player) {
							var statusBool = (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							var lotBool = (!header.hasOwnProperty("nowLot")) || (header.nowLot == player.lot);
							return statusBool && lotBool;
						}).map(function (player) {
							return player[priority];
						}));

						// 優先順位を取得できない場合は上位判定しない
						if (keyPriority === null) {
							return;
						}

						// ボーダー上のプレイヤーを取得（この時点ではボーダー上のプレイヤーは一人とは限らない）
						var keyPriorityPlayer = players.filter(function (player) {
							return (player[priority] == keyPriority);
						})[0];

						// ボーダー上のプレイヤーと比較同位のプレイヤーリストを取得
						borderPlayers = players.filter(function (player) {
							var statusBool = (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							var lotBool = (!header.hasOwnProperty("nowLot")) || (header.nowLot == player.lot);
							return statusBool && lotBool;
						}).filter(function (player) {
							return (qCommon.playerSortOn(scope.items.filter(function (item) {
								return (item.key == priority);
							})[0].order, false, scope)(keyPriorityPlayer, player) == 0);
						});

						// ボーダー上のプレイヤーが一人だけの場合
						if (borderPlayers.length == 1) {
							// そのプレイヤーは失格
							lose(borderPlayers[0], players, header, property);

							// ボーダー上のプレイヤーが二人以上の場合
						} else if (borderPlayers.length >= 2) {

							// ボーダー上にいないプレイヤーを待機状態にする
							players.filter(function (player) {
								return (["normal", "wait", "absent"].indexOf(player.status) >= 0);
							}).map(function (player) {
								if (borderPlayers.indexOf(player) < 0) {
									player.status = "wait";
								}
							});

							// プレーオフスタート
							header.playoff = true;
						}
					}

					// 再計算
					calc(scope.current.players, scope.current.header, scope.items, scope.property);
					// 履歴作成
					qCommon.createHist(scope);

				}
			}]);

		/*****************************************************************************
		 * actions - プレイヤー毎に設定する操作の設定(ラッピング)
		 ****************************************************************************/
		round.actions.map(function (action) {
			action.enable = function (player, scope) {
				return action.enable0(player, scope.current.players, scope.current.header, scope.property);
			};
			action.action = function (player, scope) {
				var players = scope.current.players;
				var header = scope.current.header;
				var property = scope.property;
				var items = scope.items;

				// 一定時間ボタン再押下不可
				qCommon.pushed(scope);
				try {
					// action0を実行
					action.action0(player, players, header, property);
					// 再計算
					calc(players, header, items, property);
					// 勝抜・敗退判定
					judgement(players, header, property);
					// 再計算
					calc(players, header, items, property);
					// ツイート生成
					if (action.hasOwnProperty('tweet') && property.tweet.hasOwnProperty(action.tweet)) {
						qCommon.editTweet(header.tweets, property.tweet[action.tweet], player, true);
					}
				} catch (e) {
					console.log("action is aborted.\n" + e);
				}
				// 履歴作成
				qCommon.createHist(scope);
			};
		});

		/*****************************************************************************
		 * global_actions - 全体に対する操作の設定(ラッピング)
		 ****************************************************************************/
		round.global_actions.map(function (global_action) {

			if (angular.isUndefined(global_action.indexes)) {
				if (angular.isDefined(global_action.indexes0)) {
					global_action.indexes = function (scope) {
						var players = scope.current.players;
						var header = scope.current.header;
						var property = scope.property;
						return global_action.indexes0(players, header, property);
					};
				}

			}

			if (angular.isUndefined(global_action.enable)) {
				if (angular.isDefined(global_action.enable0)) {
					global_action.enable = function (scope) {
						var players = scope.current.players;
						var header = scope.current.header;
						var property = scope.property;
						return global_action.enable0(players, header, property);
					};

				} else if (angular.isDefined(global_action.enable1)) {
					global_action.enable = function (index, scope) {
						var players = scope.current.players;
						var header = scope.current.header;
						var property = scope.property;
						return global_action.enable1(index, players, header, property);
					};
				}
			}
			if (angular.isUndefined(global_action.action)) {
				if (angular.isDefined(global_action.action0)) {
					global_action.action = function (scope) {
						var players = scope.current.players;
						var header = scope.current.header;
						var property = scope.property;
						var items = scope.items;

						// 一定時間ボタン再押下不可
						qCommon.pushed(scope);
						try {
							// action0を実行
							global_action.action0(players, header, property);
							// 再計算
							calc(players, header, items, property);
							// 勝抜・敗退判定
							judgement(players, header, property);
							// 再計算
							calc(players, header, items, property);
							// ツイート生成
							if (global_action.hasOwnProperty('tweet')) {
								if (property.tweet.hasOwnProperty(global_action.tweet)) {
									qCommon.editTweet(header.tweets, property.tweet[global_action.tweet], header, true);
								}
							}
						} catch (e) {
							console.log("action is aborted.\n" + e);
						}
						// 履歴作成
						qCommon.createHist(scope);
					};
				} else if (angular.isDefined(global_action.action1)) {
					global_action.action = function (index, scope) {
						var players = scope.current.players;
						var header = scope.current.header;
						var property = scope.property;
						var items = scope.items;

						try {
							// action0を実行
							global_action.action1(index, players, header, property);
							// 再計算
							calc(players, header, items, property);
							// 勝抜・敗退判定
							judgement(players, header, property);
							// 再計算
							calc(players, header, items, property);
							// ツイート生成
							if (global_action.hasOwnProperty('tweet')) {
								if (property.tweet.hasOwnProperty(global_action.tweet)) {
									qCommon.editTweet(header.tweets, property.tweet[global_action.tweet], header, true);
								}
							}
						} catch (e) {
							console.log("action is aborted.\n" + e);
						}
						// 履歴作成
						qCommon.createHist(scope);
					};
				}
			}
		});

		/*****************************************************************************
		 * setTweet - ruleに設定されたtweetのひな型を反映する
		 ****************************************************************************/
		round.setTweet = function (tweet) {
			angular.forEach(rule.tweet, function (value, key) {
				tweet[key] = value;
			});
		};

		return round;
	}]);
