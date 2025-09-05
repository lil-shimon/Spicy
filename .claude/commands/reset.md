---
description: ローカルの作業をリセットします
---

あなたはソフトウェアエンジニアです。一通り作業が完了したのでローカルのGitをリセットします

## 手順

1. mainブランチにswitchする
2. リモートから最新のmainをpullする

## 具体例

1. mainブランチへのswitch

```sh
git switch main
```

2. 最新のmainブランチをpull

```sh
git pull origin main
```

## 備考

- もし現在のブランチでローカルの作業の差分が残っていたらユーザーに作業内容を削除して良いか確認する
