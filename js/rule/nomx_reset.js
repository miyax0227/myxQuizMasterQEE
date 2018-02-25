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
  }];

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
      "css": "x"
    },
    {
      "key": "combo",
      "value": 0,
      "style": "number",
      "css": "combo"
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
        },
        {
          "key": "x",
          "order": "asc"
        }
      ]
    }
  ];

  /*****************************************************************************
   * tweet - ルール固有のツイートのひな型
   ****************************************************************************/
  rule.tweet = {
    "o": "${handleName}◯　→${o}◯",
    "x": "${handleName}×",
    "thru": "スルー"
  };

  /*****************************************************************************
   * lines - ルール固有のプレイヤー配置
   ****************************************************************************/
  rule.lines = {
    "line1": {
      "left": 1,
      "right": 0.52,
      "y": 0.75,
      "zoom": 1,
      "orderBy": "position"
    },
    "line2": {
      "left": 0.48,
      "right": 0,
      "y": 0.75,
      "zoom": 1,
      "orderBy": "position"
    },
    "line3": {
      "left": 1,
      "right": 0.52,
      "y": 0.35,
      "zoom": 1,
      "orderBy": "position"
    },
    "line4": {
      "left": 0.48,
      "right": 0,
      "y": 0.35,
      "zoom": 1,
      "orderBy": "position"
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
        return (player.status == 'normal' && !header.playoff);
      },
      "action0": function(player, players, header, property) {
        // ○を加算
        player.o++;
        // コンボ計算
        if (property.combo > 0 && player.combo === 1) {
          player.o += property.combo;
        }
        // コンボ管理
        if (property.combo > 0) {
          players.map(function(p) {
            p.combo = 0;
          });
          player.combo = 1;
        }
        setMotion(player, 'o');
        addQCount(players, header, property);
      }
    },
    {
      "name": "×",
      "css": "action_x",
      "button_css": "btn btn-danger btn-lg",
      "keyArray": "k2",
      "tweet": "x",
      "enable0": function(player, players, header, property) {
        return (player.status == 'normal' && !header.playoff);
      },
      "action0": function(player, players, header, property) {
        // swedishルールの場合
        if (angular.isArray(property.swedish)) {
          if (property.swedish[player.o] !== undefined) {
            player.x += property.swedish[player.o];
          } else {
            player.x += property.swedish[property.swedish.length - 1];
          }
          // swedishルールではない場合
        } else {
          // ×を加算
          player.x++;
        }
        // コンボ管理
        player.combo = 0;
        // up-downルールの場合、○を初期化
        if (property.updown) {
          player.o = 0;
        }

        setMotion(player, 'x');
        addQCount(players, header, property);
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
      }
    },
    {
      "name": "pos",
      "button_css": "btn btn-default",
      "group": "rule",
      "enable0": function(players, header, property) {
        return true;
      },
      "action0": function(players, header, property) {
        header.pos = !header.pos;
      },
      "keyArray": ""
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
      /* rankがない人に限定 */
      return (item.rank === 0);
    }), function(player, i) {
      /* win条件 */
      if (player.o >= property.winningPoint) {

        win(player, players, header, property);
        player.o = property.winningPoint;
        player.combo = 0;
        timerStop();
        // 勝抜が出ると残るプレイヤーのポイントをリセット
        angular.forEach(players, function(p) {
          if (p.status == "normal") {
            p.o = 0;
          }
        });

      }
      /* lose条件 */
      if (player.x >= property.losingPoint) {
        lose(player, players, header, property);
        player.x = property.losingPoint;
        player.combo = 0;
        player.o = 0;
        timerStop();
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
    header.rest = property.maxRankDisplay - players.filter(function(p) {
      return p.status == "win";
    }).length;

    angular.forEach(players, function(player, index) {
      // pinch, chance
      player.pinch = (player.x == property.losingPoint - 1) && (player.status == 'normal');
      player.chance = (player.o + 1 + player.combo * property.combo >= property.winningPoint) &&
        (player.status == 'normal');

      // キーボード入力時の配列の紐付け ローリング等の特殊形式でない場合はこのままでOK\
      player.keyIndex = player.position;
      switch (true) {
        case (player.position <= 4):
          player.line = "line1";
          break;
        case (player.position <= 9):
          player.line = "line2";
          break;
        case (player.position <= 14):
          player.line = "line3";
          break;
        default:
          player.line = "line4";
          break;
      }
    });
  }

  return rule;
}]);