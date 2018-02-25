'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * rule - ラウンド特有のクイズのルール・画面操作の設定
 ******************************************************************************/
app.factory('rule', ['qCommon', function(qCommon) {

  var rule = {};
  var win = qCommon.win;
  var lose = qCommon.lose;
  var timerStop = qCommon.timerStop;
  var setMotion = qCommon.setMotion;
  var addQCount = qCommon.addQCount;

  rule.judgement = judgement;
  rule.calc = calc;

  /*****************************************************************************
   * header - ルール固有のヘッダ
   ****************************************************************************/
  rule.head = [{
      "key": "pos",
      "value": true,
      "style": "boolean"
    },
    {
      "key": "nowLot",
      "value": 1,
      "style": "number"
    },
    {
      "key": "rule",
      "value": 0,
      "style": "number"
    }
  ];

  /*****************************************************************************
   * items - ルール固有のアイテム
   ****************************************************************************/
  rule.items = [{
      "key": "o",
      "value": 0,
      "style": "number",
      "css": "o"
    },
    {
      "key": "x",
      "value": 0,
      "style": "number",
      "css": "x",
      "repeatChar": "×"
    },
    {
      "key": "priority",
      "order": [{
          "key": "status",
          "order": "desc",
          "alter": [
            "win",
            2,
            "lose",
            0,
            1
          ]
        },
        {
          "key": "o",
          "order": "desc"
        }
      ]
    }
  ];

  /*****************************************************************************
   * tweet - ルール固有のツイートのひな型
   ****************************************************************************/
  rule.tweet = {
    "o": "${handleName}◯　→${o}◯ ${x}×",
    "x": "${handleName}×　→${o}◯ ${x}× ${absent}休",
    "thru": "スルー"
  };

  /*****************************************************************************
   * lines - ルール固有のプレイヤー配置
   ****************************************************************************/
  rule.lines = {
    "line1": {
      "left": 0,
      "right": 1,
      "y": 0.5,
      "zoom": 1,
      "orderBy": "position"
    },
    "line2": {
      "left": 0,
      "right": 1,
      "y": 0.5,
      "zoom": 1,
      "orderBy": "priority"
    }
  };

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [{
      "name": "○",
      "css": "action_o",
      "button_css": "btn btn-primary btn-lg",
      "keyArray": "k1",
      "tweet": "o",
      "enable0": function(player, players, header, property) {
        return (player.status == 'normal' && !header.playoff && player.lot == header.nowLot && header.nowLot >= 1);
      },
      "action0": function(player, players, header, property) {
        // ○を加算
        player.o++;
        setMotion(player, 'o');
        addQCount(players, header, property);
        // ×を消す
        players.filter(function(player) {
          return player.lot == header.nowLot;
        }).map(function(player) {
          player.x = 0;
        });
      }
    },
    {
      "name": "×",
      "css": "action_x",
      "button_css": "btn btn-danger btn-lg",
      "keyArray": "k2",
      "tweet": "x",
      "enable0": function(player, players, header, property) {
        return (player.status == 'normal' && !header.playoff && player.lot == header.nowLot && header.nowLot >= 1);
      },
      "action0": function(player, players, header, property) {
        setMotion(player, 'x');
        // サイドアウトの場合
        if (header.rule == 1) {
          player.x++;
        }
        // 1回休みルールの場合
        if (header.rule === 2) {
          player.absent = 1;
          player.status = "preabsent";
          addQCount(players, header, property);
        }
      }
    },
    {
      "name": "s",
      "css": "action_s",
      "button_css": "btn btn-info btn-lg",
      "keyArray": "k3",
      "enable0": function(player, players, header, property) {
        return player.lot === 0;
      },
      "action0": function(player, players, header, property) {
        player.lot = header.nowLot;
      }
    }
  ];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [{
      "name": "thru",
      "button_css": "btn btn-default",
      "group": "rule",
      "keyboard": "Space",
      "tweet": "thru",
      "enable0": function(players, header, property) {
        return true;
      },
      "action0": function(players, header, property) {
        addQCount(players, header, property);
        // ×を消す
        players.filter(function(player) {
          return player.lot == header.nowLot;
        }).map(function(player) {
          player.x = 0;
        });
      }
    },
    {
      "name": "Lose",
      "button_css": "btn btn-default",
      "group": "rule",
      "keyboard": "z",
      "enable0": function(players, header, property) {
        return true;
      },
      "action0": function(players, header, property) {
        header.rule = 0;
      }
    },
    {
      "name": "SO",
      "button_css": "btn btn-default",
      "group": "rule",
      "keyboard": "x",
      "enable0": function(players, header, property) {
        return true;
      },
      "action0": function(players, header, property) {
        header.rule = 1;
      }
    },
    {
      "name": "Abs",
      "button_css": "btn btn-default",
      "group": "rule",
      "keyboard": "c",
      "enable0": function(players, header, property) {
        return true;
      },
      "action0": function(players, header, property) {
        header.rule = 2;
      }
    },
    {
      "name": "",
      "button_css": "btn btn-default",
      "group": "rule",
      "indexes0": function(players, header, property) {
        return property.lots;
      },
      "enable1": function(index, players, header, property) {
        return true;
      },
      "action1": function(index, players, header, property) {
        header.nowLot = index;
        header.qCount = 1;
      }
    }
  ];

  /*****************************************************************************
   * judgement - 操作終了時等の勝敗判定
   * 
   * @param {Array} players - players
   * @param {Object} header - header
   * @param {Object} property - property
   ****************************************************************************/
  function judgement(players, header, property) {
    angular.forEach(players.filter(function(item) {
      /* rankがない人かつ現在の組の人 */
      return (item.rank === 0) && (item.lot == header.nowLot);
    }), function(player, i) {
      /* win条件 */
      if (player.o >= property.winningPoint) {
        // 更にデュースありルールでは２点以上差がある場合
        if (!property.deuce ||
          players.filter(function(p) {
            return (p !== player) && (p.lot == player.lot) && (p.o + 1 >= player.o);
          }).length === 0) {

          win(player, players, header, property);
        }
      }
      /* lose条件 */
      // 即失格ルールの場合
      if (header.rule === 0 && player.x >= 1) {
        lose(player, players, header, property);
        // 相手は勝ち抜け
        players.filter(function(p) {
          return (p.lot == player.lot) && (p !== player);
        }).map(function(p) {
          win(p, players, header, property);
        });
      }
    });
  }

  /*****************************************************************************
   * calc - 従属変数の計算をする
   * 
   * @param {Array} players - players
   * @param {Object} items - items
   ****************************************************************************/
  function calc(players, header, items, property) {
    // ルール名を設定する
    switch (header.rule) {
      case 0:
        header.ruleName = "1×失格";
        break;
      case 1:
        header.ruleName = "サイドアウト";
        break;
      case 2:
        header.ruleName = "1回休み";
        break;
    }
    // ２人とも×になった場合、×をリセットして次の問題へ
    if (players.filter(function(p) {
        return p.lot == header.nowLot && p.x >= 1;
      }).length >= 2) {
      players.filter(function(p) {
        return p.lot == header.nowLot && p.x >= 1;
      }).map(function(p) {
        p.x = 0;
      });
      addQCount(players, header, property);
    }

    var key = 1;
    angular.forEach(players, function(player, index) {
      player.pinch = false;
      if (player.lot == header.nowLot && player.o + 1 >= property.winningPoint) {
        // 更にデュースありルールでは２点以上差がある場合
        if (!property.deuce ||
          players.filter(function(p) {
            return (p !== player) && (p.lot == player.lot) && (p.o >= player.o);
          }).length === 0) {
          player.chance = true;
        } else {
          player.chance = false;
        }
      } else {
        player.chance = false;

      }

      // lotが0の場合は選択権ありプレイヤーを並べる
      if (header.nowLot === 0) {
        if (player.pos === 1) {
          player.line = "line1";
          player.keyIndex = player.lot;
        } else {
          player.line = "left";
          player.keyIndex = 999;
        }
      } else {
        // 当該組のプレイヤーが１人未満の場合
        if (players.filter(function(p) {
            return p.lot == header.nowLot;
          }).length <= 1) {
          // 当該組選択権ありプレイヤーを0番目、以降未未選択プレイヤーを並べる
          if (player.pos === 1) {
            if (player.lot == header.nowLot) {
              player.line = "line1";
              player.keyIndex = 0;
            } else {
              player.line = "left";
              player.keyIndex = 999;
            }
          } else {
            if (player.lot === 0) {
              player.line = "line1";
              player.keyIndex = (key++);
            } else {
              player.line = "left";
              player.keyIndex = 999;
            }
          }

          // 当該組のプレイヤーが２人の場合
        } else {
          if (player.lot == header.nowLot) {
            player.line = "line1";
            player.keyIndex = player.pos - 1;
          } else {
            player.line = "left";
            player.keyIndex = 999;
          }
        }
      }

    });
  }

  return rule;
}]);