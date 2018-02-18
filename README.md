# myxQuizMasterQEE

## 概要
オープンクイズ大会に特化した得点表示プログラム及びエディタです。サンプルとして、クイズ大会「abc the 16th」と同形式の大会を行うためのプログラムを内包しています。

- [インストール・起動方法](#インストール・起動方法)
    - [パッケージを利用する場合](#パッケージを利用する場合)
    - [リポジトリを利用する場合](#リポジトリを利用する場合)
- [遷移図](#遷移図)
    - [ウィンドウ](#ウィンドウ)
    - [ディレクトリ](#ディレクトリ)
- [使い方](#使い方)
    - [メニューウィンドウ](#メニューウィンドウ)
    - [操作ウィンドウ](#操作ウィンドウ)
        - [全ラウンド共通](#全ラウンド共通)
        - [予選](#予選)
        - [準決勝・決勝](#準決勝・決勝)
    - [Twitterウィンドウ](#Twitterウィンドウ)
- [カスタマイズ方法](#カスタマイズ方法)
    - [ウィンドウの表示位置・サイズの変更](#ウィンドウの表示位置・サイズの変更)
    - [連携先Twitterアカウントの変更](#連携先Twitterアカウントの変更)
    - [Excelファイル読み込み時の対象ワークシートの変更](#Excelファイル読み込み時の対象ワークシートの変更)
- [ライセンス](#ライセンス)
- [作成者](#作成者)

## インストール・起動方法
### パッケージを利用する場合
1. 右記のファイルをダウンロードする。
    [myxQuizMasterQEE-win32-x64.zip](https://drive.google.com/open?id=1dRZiTlTabWw8LCO1pWFaBxXTbCzBlmKQ)
1. ダウンロードしたファイルを適当な場所に展開する。
1. 'myxQuiz.exe'を実行する。

### リポジトリを利用する場合
1. Node.jsのインストール、及び Electron ver.1.7.10 の開発環境を導入する。
1. 右記のディレクトリをcloneする。[miyax0227/myxQuizMasterQEE](https://github.com/miyax0227/myxQuizMasterQEE)
1. リポジトリの最上位ディレクトリに移動する。
1. 不足しているディレクトリ（`/current/history`, `/twitter/backup`)を作成するため、下記コマンドを実行する。  
     ファイルロックによりエラーが発生する場合は、エラーが発生しなくなるまで繰り返す。
    ```Shell
    node clean.js
    ```
1. Electronコマンドによりmain.jsを読み込む。
    ```Shell
    electron .
    ```

## 遷移図
![Flow](http://drive.google.com/uc?export=view&id=0B00MyT_-RKCUR0xqOUpSeXotaWc)
### ウィンドウ
1. メニューウィンドウ  
    起動時に開くウィンドウ。他のウィンドウを開いたり、ファイル操作をしたりする。
1. 操作ウィンドウ  
    得点操作を行うウィンドウ。ラウンド毎に異なるウィンドウが開く。
1. 表示ウィンドウ  
    プロジェクタに得点表示するためのウィンドウ。操作ウィンドウから操作ボタンを取り除いたデザインとなっている。
1. Twitterウィンドウ  
    Twitterにツイートや画像を連携するウィンドウ。このウィンドウが開いている時に限りTwitter連携を行う。
### ディレクトリ
1. `/history/current`  
    名前リストファイル、ラウンド毎のエントリーファイル、履歴ファイルを格納する。
1. `/twitter`  
    Twitterに連携するツイートを記載したファイル(`*.txt`)や画面キャプチャ(`*.png`)を格納する。連携し終えたファイルは`/twitter/backup`に移送される。

## 使い方
### メニューウィンドウ
![Menu Window Usage](http://drive.google.com/uc?export=view&id=0B00MyT_-RKCUYlEzTzJORHZURE0)
1.  **招集(全体)**   
     **最初に実施する。** Excel形式のエントリーリストを読み込む。ファイルを選択するとウィンドウ下部にプレビューが表示され、OKボタン押下により読み込みが完了する。  
     [エントリーリストのサンプル](https://drive.google.com/open?id=1yoIlNd7rqGSXvheHPeLm-G7ZY0J6ZcKt)
1.  **招集(個別)**  
    **各ラウンドの実行前に実施する。** エントリーリストまたは前ラウンドの結果から各ラウンドに参加する人を読み込む。画面下部にプレビューが表示される。OKボタン押下により読み込みが完了する。
1. **ラウンド開始**  
    **各ラウンドを開始する。** 各ラウンドの操作ウィンドウが開く。以前に開いて中断したラウンドの場合は、中断した時点の履歴から再開する。
1. 初期化(全体)  
    読み込み状態を初期化する。1. 招集(全体)を行う前の状態に戻る。
1. 初期化(個別)  
    各ラウンドの状態を初期化する。3. ラウンド開始を行う前の状態に戻る。
1. Twitter  
    Twitterウィンドウを開く。
1. フォルダ  
    プログラムがインストールされたフォルダを開く。
1. エディタ  
    ルール等を編集するためのエディタを開く。
        
### 操作ウィンドウ
#### 全ラウンド共通
![Operation Window Usage](http://drive.google.com/uc?export=view&id=0B00MyT_-RKCUWndHU3FJazNkRlk)
1. **Basic**  
    1. **view**  
    **表示用ウィンドウを開く。** 表示用ウィンドウはスクリーンに映写するためのウィンドウで、操作用ウィンドウの操作結果と同期している。
    1. edit  
    エディット用のモーダル画面を開く。プレイヤー名や成績を変更できる。
    1. ss  
    スクリーンショットを取得する。Twitter画面を開いている場合、指定したTwitterアカウントに取得したスクリーンショットを投稿できる。
1. Rule  
    各ラウンドの形式固有の操作を行う。スルー、組分け変更など。形式によってボタンの種類が異なる。
1. View
    1. award  
    優勝決定時に表示されるカットイン表示のON/OFF切替を行う。決勝ラウンドでのみ使用する。
    1. open  
    氏名が隠されたプレイヤーについて、上位から開示（いわゆる「ターンオーバー」）を行う。ペーパーテストの結果発表等で使用する。
1. History
    1. undo  
    直前の操作を取り消す。
    1. redo  
    直前のundoを取り消す。
1. Playoff  
    1. regular  
    プレーオフ状態から通常状態に戻す。
    1. playoff  
    プレーオフを開始する。プレーオフでは、各プレイヤーの勝抜・失格・待機をワンボタンで変更できる。
    1. upper  
    勝抜または失格していないプレイヤーのうち、成績最上位のプレイヤーを勝抜にする。複数のプレイヤーがいる場合は当該プレイヤー以外を待機状態にしてプレーオフを開始する。
    1. lower  
    勝抜または失格していないプレイヤーのうち、成績最下位のプレイヤーを失格にする。複数のプレイヤーがいる場合は当該プレイヤー以外を待機状態にしてプレーオフを開始する。        
1. Timer
    1. ＋  
    タイマーを1秒増やします。
    1. －  
    タイマーを1秒減らします。
    1. start/reset  
    タイマーを開始する。または開始時の時間に戻す。
    1. stop/restart  
    タイマーを一時停止する。または一時停止状態から最下位する。
    1. show/hide  
    タイマーの表示/非表示を切り替える。
    1. exp  
    ラウンドの説明文を一文ずつ表示する。

#### 形式毎  [Demo]  
準備中

### Twitterウィンドウ
![Twitter Window Usage](http://drive.google.com/uc?export=view&id=0B00MyT_-RKCUM3lmNzM1UXZ2OVU)
1. ツイート履歴
    得点表示プログラムからTwitterアカウントに連携されたツイートの履歴を表示する。新しいツイートほど上に表示する。Deleteボタン押下によりツイートを削除します。行を選択すると、そのツイートに対するリプライができる。

1. 手動ツイート
    Twitterアカウントに任意のツイートを連携できる。
    
1. アカウント選択
    連携先のTwitterアカントを選択できる。

## カスタマイズ方法
準備中
![サンプル1](http://drive.google.com/uc?export=view&id=1IxbcaUeavc0Vm7S7E9cpogA2loip8OOC)
![サンプル2](http://drive.google.com/uc?export=view&id=18SusMiQ9ARPgwzRUh6t3OaxotF1zUXyl)
![サンプル3](http://drive.google.com/uc?export=view&id=1wQVRxU2_pP9sGd5MkQx6ClAprIOlTs0t)
![サンプル4](http://drive.google.com/uc?export=view&id=1wuwffOtdgkgGTPlz9pFBZ6Dp2N_lnwl_)

### ライセンス
Copyright (C) 2017 R. MIYAMOTO  
Licensed under MIT  
  
Includes MigMix Font  
Copyright (C) 2002-2015 M+ FONTS PROJECT  
Copyright(c) Information-technology Promotion Agency, Japan (IPA), 2003-2011.  
http://mix-mplus-ipa.osdn.jp/migmix/IPA_Font_License_Agreement_v1.0.txt  

## 作成者
R. MIYAMOTO (Miyax)  
[Github](https://github.com/miyax0227)  
[Twitter](https://twitter.com/mi_yax)  

