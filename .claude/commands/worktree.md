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
   - .serena ディレクトリのコピー

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

# ワークツリーのパスを変数に保存
WORKTREE_PATH="../Spicy.worktree/$ARGUMENTS"

# 最新のmainブランチからワークツリーを作成（新しいブランチを作成）
echo "🌳 ワークツリーを作成中..."
git worktree add "$WORKTREE_PATH" -b $ARGUMENTS origin/main

# 依存関係をインストール（現在のディレクトリから実行）
echo "📦 依存関係をインストール中..."
pnpm install --prefix "$WORKTREE_PATH"

# 必要なファイルをワークツリーにコピー（現在のディレクトリから）
cp .env "$WORKTREE_PATH/" 2>/dev/null || echo ".env ファイルが見つかりません（必要に応じて手動で作成してください）"
cp -r .serena "$WORKTREE_PATH/" 2>/dev/null || echo ".serena ディレクトリが見つかりません（必要に応じて手動でコピーしてください）"

# その他の必要なファイル（存在する場合のみコピー）
cp .env.local "$WORKTREE_PATH/" 2>/dev/null || true
cp .claude/settings.local.json "$WORKTREE_PATH/.claude/" 2>/dev/null || true

echo "✅ ワークツリー '$ARGUMENTS' のセットアップが完了しました！"
echo "📁 場所: $(realpath "$WORKTREE_PATH")"
echo "🌳 ブランチ: $ARGUMENTS"
echo ""
echo "💡 ワークツリーで作業を開始するには："
echo "   cd $WORKTREE_PATH"
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
