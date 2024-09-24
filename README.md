## はじめに
初めまして、Rollphesと言う者です。<br>
このレポジトリは[Artifacterのジェネレータ](https://github.com/FuroBath/ArtifacterImageGen)を遊び半分でNode.jsでも動作する様に移植した物です。<br>
基本的に[Genshin Impact(JPN)](https://discord.gg/2zRjGNFTuJ)にあるビルドカード機能(自作＆未公開)のライブラリやコードをそのまま引っ張ってきてデザインを参考にリライトした物です。<br>
作成期間1日なのでかなりコードは汚いです。気が向いたらリファクタリングします。<br>
もし問題点等あればissue等を用いて頂ければ幸いです。<br>
もちろんTwitter(ユーザー名とID一緒です)やDiscordでも対応できます。<br>

## 動作環境
[Node.js](https://nodejs.org/ja/)が使えれば基本どれでも動くと思います。<br>

**DiscordBotはコマンド未対応、パネルのみ動作します。(いずれ気が向いたら対応させます)**<br>


## 実行方法(DiscordBotの場合)
#### 必要環境変数
BOT_TOKEN　=>　DiscordのBOTトークンです。<br>
build_channel => 導入サーバーのパネルを設置するチャンネルIDです。開発者モードをONにして入手ください。
#### 実行コマンド
初回起動(導入含む)
```
git clone https://github.com/Rollphes/ArtifacterImageGen.git
cd ArtifacterImageGen
npm install
npm run start
```
↓二回目以降
```
npm run start-bot
```

## 実行方法(WebAPIの場合)
#### 必要環境変数
PORT => WebAPIServerのポート番号です。(省略時3000)
#### 実行コマンド
初回起動(導入含む)
```
git clone https://github.com/Rollphes/ArtifacterImageGen.git
cd ArtifacterImageGen
npm install
npm run start
```
↓二回目以降
```
npm run start-api
```

## 仕様

1. 本リポジトリは[genshin-manager](https://www.npmjs.com/package/genshin-manager)を用いています。
   この為、バージョン毎のメンテナンスは不要です。
2. APIで動作させた場合、大体RSS:200MB程度で動作します。
3. 生成時間は初回時にEnkaNetworkから取得する関係上3秒、以降1分間のキャッシュ生存時は300msとなります。
4. スコア計算式やランク等に関してはArtifacterに合わせてあります。

## カスタマイズ
#### スコア計算方式を変更したい!
`./lib/buildCard/util/ScoringArtifact.ts`から変更可能です。
- `correctionStatsValue`メソッドは会心率×2等のように、特定のパラメータに乗算等の調整を施す際に使われています。

- `scoringArtifact`メソッドは加算されるパラメータの組み合わせを設定しています。
#### ランクの閾値を変更したい!
- 聖遺物の下部に表示されるランクの閾値を変更したい場合は、`./lib/buildCard/parts/ArtifactScoreRank.ts`の`getScoreRank`メソッドを変更ください。
- トータルスコアに表示されるランクの閾値を変更したい場合は、`./lib//buildCard/parts/TotalScoreRank.ts`の`getScoreRank`メソッドを変更ください。