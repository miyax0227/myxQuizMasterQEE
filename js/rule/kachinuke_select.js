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
      "key": "lot",
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
    "wait1": {
      "x": 0.12,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait2": {
      "x": 0.24,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait3": {
      "x": 0.36,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait4": {
      "x": 0.48,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait5": {
      "x": 0.6,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait6": {
      "x": 0.72,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait7": {
      "x": 0.84,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "wait8": {
      "x": 0.96,
      "top": 0.6,
      "bottom": 0.8,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course1": {
      "x": 0.12,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course2": {
      "x": 0.24,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course3": {
      "x": 0.36,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course4": {
      "x": 0.48,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course5": {
      "x": 0.6,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course6": {
      "x": 0.72,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course7": {
      "x": 0.84,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    },
    "course8": {
      "x": 0.96,
      "top": 0.2,
      "bottom": 0.4,
      "zoom": 0.35,
      "orderBy": "keyIndex"
    }
  };

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [{
    "name": "S",
    "css": "action_s",
    "button_css": "btn btn-primary btn-lg",
    "keyArray": "k1",
    "enable0": function(player, players, header, property) {
      return true;
    },
    "action0": function(player, players, header, property) {
      if (player.lot === 0) {
        player.lot = header.nowCourse;
      } else {
        player.lot = 0;
      }
    }
  }];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [{
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
      header.nowCourse = index;
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
    var key = {};
    var courseCount = property.courseArray.length;

    for (var i = 1; i <= courseCount; i++) {
      key["wait" + i] = 0;
      key["course" + i] = 0;
    }

    angular.forEach(players, function(player, index) {
      player.nameLat = player.name;
      var wait = 1 + Math.floor(index / (players.length / courseCount));

      if (player.lot === 0) {
        player.keyIndex = (key["wait" + wait]++);
        player.line = "wait" + wait;
      } else {
        player.keyIndex = (key["course" + player.lot]++);
        player.line = "course" + player.lot;
      }

    });
  }

  return rule;
}]);