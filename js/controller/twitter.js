'use strict';

var appName = "myxQuizTwitter";
var app = angular.module(appName, ["ui.bootstrap", "ngTwitter"]);

/** twitter画面用コントローラ */
app.controller('twitter', ['$scope', 'qTwitter', function ($scope, qTwitter) {
  $scope.accounts = qTwitter.accounts;
  $scope.history = qTwitter.history;
  $scope.accountNum = qTwitter.accountNum;

  /** アカウント番号を変更する
   * @param {number} num アカウント番号
   */
  $scope.setAccountNum = function setAccountNum(num) {
    $scope.accountNum = num;
    qTwitter.setAccountNum(num);
  };

  /** 新しいツイートを投稿する
   */
  $scope.newTweetSubmit = function () {
    qTwitter.newTweetSubmit($scope.newTweet);
    $scope.newTweet = "";
  };

  /** ツイートに返信する 
  */
  $scope.replySubmit = function () {
    qTwitter.replySubmit($scope.newTweet, $scope.tweetId);
    $scope.newTweet = "";
    $scope.tweetId = null;
  };

  /** ツイートを削除する
   * @param {object} obj 削除対象ツイート
   */
  $scope.deleteTweet = function (obj) {
    qTwitter.deleteTweet(obj.id);
    obj.id = null;
  };

  /** 返信/削除対象ツイートに設定する
   * @param {number} id 対象ツイートのid
   */
  $scope.setTweetId = function (id) {
    $scope.tweetId = id;
  };

}]);

