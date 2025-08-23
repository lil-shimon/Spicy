---
description: Git worktreeを作成して開発環境をセットアップします
argument-hint: <worktree-name>
---

指定された名前でgit worktreeを作成し、開発環境を自動的にセットアップします。

## 実行内容

1. **最新コードの取得**
   - 最新のmainブランチをリモートから取得

2. **ワークツリーの作成**
   - `../Spicy.worktree/$ARGUMENTS` にワークツリーを作成
   - 最新のmainブランチから新しいブランチ `$ARGUMENTS` を作成

3. **開発環境のセットアップ**
   - 依存関係のインストール (pnpm install)
   - 環境ファイル (.env) のコピー
   - .selena ディレクトリのコピー

## 実行手順

以下のコマンドを順番に実行してください：

```bash
# 現在のブランチを保存
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 現在のブランチ: $CURRENT_BRANCH"

# mainブランチの最新を取得
echo "📡 最新のmainブランチを取得中..."
git fetch origin main:main

# ワークツリーディレクトリが存在しない場合は作成
mkdir -p ../Spicy.worktree

# 最新のmainブランチからワークツリーを作成（新しいブランチを作成）
echo "🌳 ワークツリーを作成中..."
git worktree add ../Spicy.worktree/$ARGUMENTS -b $ARGUMENTS origin/main

# 作成したワークツリーに移動
cd ../Spicy.worktree/$ARGUMENTS

# 依存関係をインストール
pnpm install

# 元のディレクトリから必要なファイルをコピー
cp ../../spicy/.env . 2>/dev/null || echo ".env ファイルが見つかりません（必要に応じて手動で作成してください）"
cp -r ../../spicy/.selena . 2>/dev/null || echo ".selena ディレクトリが見つかりません（必要に応じて手動でコピーしてください）"

# その他の必要なファイル（存在する場合のみコピー）
cp ../../spicy/.env.local . 2>/dev/null || true
cp -r ../../spicy/.kiro . 2>/dev/null || true

echo "✅ ワークツリー '$ARGUMENTS' のセットアップが完了しました！"
echo "📁 場所: $(pwd)"
echo "🌳 ブランチ: $ARGUMENTS"
```

## 使用例

```
/worktree feature-new-exchange
```

これにより、`feature-new-exchange` という名前のワークツリーとブランチが作成され、開発環境が自動的にセットアップされます。

## 注意事項

- ワークツリー名はブランチ名としても使用されます
- 既存のブランチ名と重複しないようにしてください
- .env ファイルには機密情報が含まれる可能性があるため、適切に管理してください
