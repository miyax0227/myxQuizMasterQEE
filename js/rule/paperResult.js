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
  rule.head = [];

  /*****************************************************************************
   * items - ルール固有のアイテム
   ****************************************************************************/
  rule.items = [{
      "key": "paperPts",
      "value": 0,
      "style": "number",
      "css": "paperPts",
      "suffix": "点"
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
    "line_left": {
      "x": 0.25,
      "top": 0.15,
      "bottom": 0.95,
      "zoom": 1,
      "orderBy": "keyIndex"
    },
    "line_center": {
      "x": 0.5,
      "top": 0.15,
      "bottom": 0.95,
      "zoom": 1,
      "orderBy": "keyIndex"
    },
    "line_right": {
      "x": 0.75,
      "top": 0.15,
      "bottom": 0.95,
      "zoom": 1,
      "orderBy": "keyIndex"
    }
  };

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [{
    "name": "",
    "button_css": "btn btn-default",
    "group": "rule",
    "indexes0": function(players, header, property) {
      return property.lotsName;
    },
    "enable1": function(index, players, header, property) {
      return true;
    },
    "action1": function(index, players, header, property) {
      header.nowLot = property.lotsName.indexOf(index);
    }
  }];

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

    angular.forEach(players, function(player) {
      player.nameLat = player.name;
      player.keyIndex = 999;
      player.line = "left";
    });

    angular.forEach(property.lotConfigs, function(lotConfig) {
      key = 0;

      if (lotConfig.lot === header.nowLot) {
        for (var i = lotConfig.min; i <= lotConfig.max; i++) {
          var player = players.filter(function(p) {
            return p.paperRank === i;
          })[0];
          player.keyIndex = (key++);
          player.line = lotConfig.line;
        }
      }
    })
  }

  return rule;
}]);