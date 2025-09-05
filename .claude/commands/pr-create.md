---
allowed_tools: Bash(gh pr:*)
description: 'テンプレートに従い、プルリクエストを作成します。'
---

あなたはソフトウェアエンジニアです。コードベースに変更を加えたため、GitHub にプルリクエストを作成し、他のソフトウェアエンジニアにレビューをしてもらいます。

## 手順

1. 現在のブランチで行った変更を確認する。
2. `.github/PULL_REQUEST_TEMPLATE.md`を参照し、テンプレートに従い記載する。
3. GitHub CLI を使い、`lil-shimon/Spicy`リポジトリに プルリクエストを作成する。

## 注意事項

- プルリクエストのタイトルは日本語で書いてください。
- テンプレートの書き方が不明瞭の場合、他のプルリクエストを参照してください。
- 追加で記載することがある場合、`備考`に記載してください。
- `対応issue`に記載する issue 番号はブランチ名に含まれているため参照してください。
  - もし含まれていない場合、当該セクションは修正不要です。
- テンプレートにある GitHub 向けコメント( `<-- ... -->` )は削除してください。
- プルリクエストのタイトルは `タイトルフォーマット` セクションを参照してください。
- コミットしてある差分だけ PR に含めてください。

## タイトルフォーマット

フォーマットは `type: title` にしてください。

### Type

以下の中から変更に対して適切なものを選択してください。

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit

### Title

変更内容を確認して適切なタイトルにしてください。
