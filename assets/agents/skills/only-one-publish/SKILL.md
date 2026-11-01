---
name: only-one-publish
description: Automate semantic version bumping, CHANGELOG generation, git tagging, and package publishing to GitHub Packages or npm registry.
---

# Only-One Publish (Release & Publishing Skill)

## Overview

Kỹ năng này tự động hoá toàn bộ chu trình phát hành phần mềm:
1. Phân tích git commit history theo chuẩn Conventional Commits.
2. Xác định mức tăng version (`patch`, `minor`, `major`).
3. Cập nhật `CHANGELOG.md` theo chuẩn Keep a Changelog.
4. Nâng version trong `package.json` và tạo Git Tag `v*`.
5. Hỗ trợ xuất bản private package lên GitHub Packages (`@personal-source-sp/only-one`).

## Input

```text
/only-one-publish [--dry-run] [--bump patch|minor|major] [--tag] [--target github|npm]
```

## Available Scripts

- **`scripts/release-helper.ts`**:
  ```bash
  npx tsx assets/agents/skills/only-one-publish/scripts/release-helper.ts [--dry-run] [--bump patch|minor|major] [--tag]
  ```
- **`scripts/publish.js`**:
  ```bash
  node scripts/publish.js --target github [--dry-run]
  ```

## Hướng dẫn Cài đặt Package Private cho Thành viên

Để cài đặt và sử dụng `@personal-source-sp/only-one` từ GitHub Packages, người dùng cấu hình tệp `~/.npmrc` cá nhân:

```bash
@personal-source-sp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Sau đó chạy lệnh:
```bash
npm install -g @personal-source-sp/only-one
only-one --version
```

