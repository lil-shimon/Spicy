---
description: Create git commit
allowed-tools: Bash(git *), Read
---

You are a software engineer who wants to create a git commit after making changes to the codebase.

## Steps

1. Review changes made on the current branch.
2. Add files to staging.
3. Repeat step 2 until all files are committed.
4. push

## Notes

- Multiple files can be added in step 2.
- Only add files with the same context in step 2.
  - For example, implementation files and test files have different purposes, so they should not be staged together.
- **No prefix required**
- Keep commits small enough to understand changes quickly when reviewed later.
