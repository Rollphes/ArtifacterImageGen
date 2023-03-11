## はじめに
初めまして、Rollphesと言う者です。普段は原神で遊びまくってるただの社会人ニ年目です。<br>
このレポジトリは[Artifacterのジェネレータ](https://github.com/FuroBath/ArtifacterImageGen)を遊び半分でNode.jsでも動作する様に移植した物です。<br>
基本的に[Genshin Impact(JPN)](https://discord.gg/2zRjGNFTuJ)にあるビルドカード機能(自作＆未公開)のライブラリやコードをそのまま引っ張ってきてデザインを参考にリライトした物です。<br>
作成期間1日なのでかなりコードは汚いです。気が向いたらリファクタリングします。<br>
もし問題点等あればissue等を用いて頂ければ幸いです。<br>
もちろんTwitter(ユーザー名とID一緒です)やDiscordでも対応できます。<br>

## 動作環境
[Node.js](https://nodejs.org/ja/)が使えれば基本どれでも動くと思います。<br>

## 注意点(更新について)
バージョン毎にファイルを更新する必要があり、./lib/enkaManager/json内のjsonファイルを[Enka.network](https://github.com/EnkaNetwork/API-docs)が提供しているstore内のjsonファイル(最新状態)に更新する必要があります<br>

## 実行方法
初回起動(導入含む)
```
npm clone https://github.com/Rollphes/ArtifacterImageGen.git
cd ArtifacterImageGen
npm install
npm run start
```
↓二回目以降
```
npm run start
```