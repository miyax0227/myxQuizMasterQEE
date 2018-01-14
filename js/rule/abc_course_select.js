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
    "key": "nowCourse",
    "value": 0,
    "style": "number"
  }];

  /*****************************************************************************
   * items - ルール固有のアイテム
   ****************************************************************************/
  rule.items = [{
      "key": "selected",
      "value": 0,
      "style": "boolean",
      "css": "select"
    },
    {
      "key": "course",
      "value": 0,
      "style": "number"
    },
    {
      "key": "priority",
      "order": []
    }
  ];

  /*****************************************************************************
   * tweet - ルール固有のツイートのひな型
   ****************************************************************************/
  rule.tweet = {};

  /*****************************************************************************
   * lines - ルール固有のプレイヤー配置
   ****************************************************************************/
  rule.lines = {
    "line1": {
      "left": 0,
      "right": 1,
      "y": 0.4,
      "zoom": 1,
      "orderBy": "position"
    },
    "line2": {
      "left": 0,
      "right": 1,
      "y": 0.9,
      "zoom": 0.5,
      "orderBy": "keyIndex"
    }
  };

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [{
    "name": "select",
    "css": "action_o",
    "button_css": "btn btn-primary btn-lg",
    "keyArray": "k1",
    "enable0": function(player, players, header, property) {
      return true;
    },
    "action0": function(player, players, header, property) {
      player.selected = !player.selected;
    }
  }];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [{
      "name": "commit",
      "button_css": "btn btn-default",
      "group": "rule",
      "keyboard": "Space",
      "enable0": function(players, header, property) {
        return (header.nowCourse > 0);
      },
      "action0": function(players, header, property) {
        // そのコースがまだ決定前の場合
        if (players.filter(function(p) {
            return p.course == header.nowCourse;
          }).length === 0) {
          // 希望者を上位からコース決定
          var rest = property.capacity;
          players.filter(function(p) {
            return p.course === 0 && p.selected;
          }).map(function(p) {
            if (rest > 0) {
              p.course = header.nowCourse;
              rest--;
            }
          });
          // 不足分を下位から補充
          if (rest > 0) {
            players.filter(function(p) {
              return p.course === 0;
            }).splice(-rest, rest).map(function(p) {
              p.course = header.nowCourse;
            });
          }

          // そのコースが決定後の場合
        } else {
          // コース選択を解除
          players.filter(function(p) {
            return p.course == header.nowCourse;
          }).map(function(p) {
            p.course = 0;
          });
        }

        // 全プレイヤーの選択を解除
        players.map(function(p) {
          p.selected = false;
        });

      }
    },
    {
      "name": "",
      "button_css": "btn btn-default",
      "group": "rule",
      "indexes0": function(players, header, property) {
        return property.courseArray;
      },
      "enable1": function(index, players, header, property) {
        return true;
      },
      "action1": function(index, players, header, property) {
        header.nowCourse = property.courseName.indexOf(index);
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
      /* rankがない人に限定 */
      return (item.rank === 0);
    }), function(player, i) {

    });
  }

  /*****************************************************************************
   * calc - 従属変数の計算をする
   * 
   * @param {Array} players - players
   * @param {Object} items - items
   ****************************************************************************/
  function calc(players, header, items, property) {
    var key = 0;
    angular.forEach(players, function(player, index) {
      if (player.course === 0) {
        player.keyIndex = (key++);
        player.line = "line2";
      } else if (player.course == header.nowCourse) {
        player.keyIndex = 999;
        player.line = "line1";
      } else {
        player.line = "left";
      }

    });
  }

  return rule;
}]);